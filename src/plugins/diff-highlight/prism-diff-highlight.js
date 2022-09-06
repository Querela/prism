import { Token, getTextContent } from '../../core/token';
import diff, { PREFIXES } from '../../languages/prism-diff';
import { addHooks } from '../../shared/hooks-util';

export default /** @type {import("../../types").PluginProto<'diff-highlight'>} */ ({
	id: 'diff-highlight',
	require: diff,
	effect(Prism) {
		const LANGUAGE_REGEX = /^diff-([\w-]+)/i;

		/**
		 * @param {import('../../core/hooks-env.js').BeforeSanityCheckEnv | import('../../core/hooks-env.js').BeforeTokenizeEnv} env
		 */
		const setMissingGrammar = (env) => {
			const lang = env.language;
			if (LANGUAGE_REGEX.test(lang) && !env.grammar) {
				env.grammar = Prism.components.getLanguage('diff');
			}
		};

		return addHooks(Prism.hooks, {
			'before-sanity-check': setMissingGrammar,
			'before-tokenize': setMissingGrammar,
			'after-tokenize': (env) => {
				const langMatch = LANGUAGE_REGEX.exec(env.language);
				if (!langMatch) {
					return; // not a language specific diff
				}

				const diffLanguage = langMatch[1];
				const diffGrammar = Prism.components.getLanguage(diffLanguage);
				if (!diffGrammar) {
					return;
				}

				for (const token of env.tokens) {
					if (typeof token === 'string' || !(token.type in PREFIXES) || !Array.isArray(token.content)) {
						continue;
					}

					const type = /** @type {keyof PREFIXES} */ (token.type);
					let insertedPrefixes = 0;
					const getPrefixToken = () => {
						insertedPrefixes++;
						return new Token('prefix', PREFIXES[type], /\w+/.exec(type)?.[0]);
					};

					const withoutPrefixes = token.content.filter(t => typeof t === 'string' || t.type !== 'prefix');
					const prefixCount = token.content.length - withoutPrefixes.length;

					const diffTokens = Prism.tokenize(getTextContent(withoutPrefixes), diffGrammar);

					// re-insert prefixes

					// always add a prefix at the start
					diffTokens.unshift(getPrefixToken());

					const LINE_BREAK = /\r\n|\n/g;
					/**
					 * @param {string} text
					 * @returns {import('../../core/token').TokenStream | undefined}
					 */
					const insertAfterLineBreakString = (text) => {
						/** @type {import('../../core/token').TokenStream} */
						const result = [];
						LINE_BREAK.lastIndex = 0;
						let last = 0;
						let m;
						while (insertedPrefixes < prefixCount && (m = LINE_BREAK.exec(text))) {
							const end = m.index + m[0].length;
							result.push(text.slice(last, end));
							last = end;
							result.push(getPrefixToken());
						}

						if (result.length === 0) {
							return undefined;
						}

						if (last < text.length) {
							result.push(text.slice(last));
						}
						return result;
					};
					/**
					 * @param {import('../../core/token').TokenStream} tokens
					 */
					const insertAfterLineBreak = (tokens) => {
						for (let i = 0; i < tokens.length && insertedPrefixes < prefixCount; i++) {
							const token = tokens[i];

							if (typeof token === 'string') {
								const inserted = insertAfterLineBreakString(token);
								if (inserted) {
									tokens.splice(i, 1, ...inserted);
									i += inserted.length - 1;
								}
							} else if (typeof token.content === 'string') {
								const inserted = insertAfterLineBreakString(token.content);
								if (inserted) {
									token.content = inserted;
								}
							} else {
								insertAfterLineBreak(token.content);
							}
						}
					};
					insertAfterLineBreak(diffTokens);

					if (insertedPrefixes < prefixCount) {
						// we are missing the last prefix
						diffTokens.push(getPrefixToken());
					}

					token.content = diffTokens;
				}
			}
		});
	}
});
