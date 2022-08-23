import { rest } from '../shared/symbols';

export default /** @type {import("../types").LanguageProto} */ ({
	id: 'sas',
	grammar() {
		let stringPattern = /(?:"(?:""|[^"])*"(?!")|'(?:''|[^'])*'(?!'))/.source;

		let number = /\b(?:\d[\da-f]*x|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/i;
		let numericConstant = {
			pattern: RegExp(stringPattern + '[bx]'),
			alias: 'number'
		};

		let macroVariable = {
			pattern: /&[a-z_]\w*/i
		};

		let macroKeyword = {
			pattern: /((?:^|\s|=|\())%(?:ABORT|BY|CMS|COPY|DISPLAY|DO|ELSE|END|EVAL|GLOBAL|GO|GOTO|IF|INC|INCLUDE|INDEX|INPUT|KTRIM|LENGTH|LET|LIST|LOCAL|PUT|QKTRIM|QSCAN|QSUBSTR|QSYSFUNC|QUPCASE|RETURN|RUN|SCAN|SUBSTR|SUPERQ|SYMDEL|SYMEXIST|SYMGLOBL|SYMLOCAL|SYSCALL|SYSEVALF|SYSEXEC|SYSFUNC|SYSGET|SYSRPUT|THEN|TO|TSO|UNQUOTE|UNTIL|UPCASE|WHILE|WINDOW)\b/i,
			lookbehind: true,
			alias: 'keyword'
		};

		let step = {
			pattern: /(^|\s)(?:proc\s+\w+|data(?!=)|quit|run)\b/i,
			alias: 'keyword',
			lookbehind: true
		};

		let comment = [
			/\/\*[\s\S]*?\*\//,
			{
				pattern: /(^[ \t]*|;\s*)\*[^;]*;/m,
				lookbehind: true
			}
		];

		let string = {
			pattern: RegExp(stringPattern),
			greedy: true
		};

		let punctuation = /[$%@.(){}\[\];,\\]/;

		let func = {
			pattern: /%?\b\w+(?=\()/,
			alias: 'keyword'
		};

		let args = {
			'function': func,
			'arg-value': {
				pattern: /(=\s*)[A-Z\.]+/i,
				lookbehind: true
			},
			'operator': /=/,
			'macro-variable': macroVariable,
			'arg': {
				pattern: /[A-Z]+/i,
				alias: 'keyword'
			},
			'number': number,
			'numeric-constant': numericConstant,
			'punctuation': punctuation,
			'string': string
		};

		let format = {
			pattern: /\b(?:format|put)\b=?[\w'$.]+/i,
			inside: {
				'keyword': /^(?:format|put)(?==)/i,
				'equals': /=/,
				'format': {
					pattern: /(?:\w|\$\d)+\.\d?/,
					alias: 'number'
				}
			}
		};

		let altformat = {
			pattern: /\b(?:format|put)\s+[\w']+(?:\s+[$.\w]+)+(?=;)/i,
			inside: {
				'keyword': /^(?:format|put)/i,
				'format': {
					pattern: /[\w$]+\.\d?/,
					alias: 'number'
				}
			}
		};

		let globalStatements = {
			pattern: /((?:^|\s)=?)(?:catname|checkpoint execute_always|dm|endsas|filename|footnote|%include|libname|%list|lock|missing|options|page|resetline|%run|sasfile|skip|sysecho|title\d?)\b/i,
			lookbehind: true,
			alias: 'keyword'
		};

		let submitStatement = {
			pattern: /(^|\s)(?:submit(?:\s+(?:load|norun|parseonly))?|endsubmit)\b/i,
			lookbehind: true,
			alias: 'keyword'
		};

		let actionSets = /aStore|accessControl|aggregation|audio|autotune|bayesianNetClassifier|bioMedImage|boolRule|builtins|cardinality|cdm|clustering|conditionalRandomFields|configuration|copula|countreg|dataDiscovery|dataPreprocess|dataSciencePilot|dataStep|decisionTree|deduplication|deepLearn|deepNeural|deepRnn|ds2|ecm|entityRes|espCluster|explainModel|factmac|fastKnn|fcmpact|fedSql|freqTab|gVarCluster|gam|gleam|graphSemiSupLearn|hiddenMarkovModel|hyperGroup|ica|image|iml|kernalPca|langModel|ldaTopic|loadStreams|mbc|mixed|mlTools|modelPublishing|network|neuralNet|nmf|nonParametricBayes|nonlinear|optNetwork|optimization|panel|pca|percentile|phreg|pls|qkb|qlim|quantreg|recommend|regression|reinforcementLearn|robustPca|ruleMining|sampling|sandwich|sccasl|search(?:Analytics)?|sentimentAnalysis|sequence|session(?:Prop)?|severity|simSystem|simple|smartData|sparkEmbeddedProcess|sparseML|spatialreg|spc|stabilityMonitoring|svDataDescription|svm|table|text(?:Filters|Frequency|Mining|Parse|Rule(?:Develop|Score)|Topic|Util)|timeData|transpose|tsInfo|tsReconcile|uniTimeSeries|varReduce/.source;

		let casActions = {
			pattern: RegExp(/(^|\s)(?:action\s+)?(?:<act>)\.[a-z]+\b[^;]+/.source.replace(/<act>/g, function () { return actionSets; }), 'i'),
			lookbehind: true,
			inside: {
				'keyword': RegExp(/(?:<act>)\.[a-z]+\b/.source.replace(/<act>/g, function () { return actionSets; }), 'i'),
				'action': {
					pattern: /(?:action)/i,
					alias: 'keyword'
				},
				'comment': comment,
				'function': func,
				'arg-value': args['arg-value'],
				'operator': args.operator,
				'argument': args.arg,
				'number': number,
				'numeric-constant': numericConstant,
				'punctuation': punctuation,
				'string': string
			}
		};

		let keywords = {
			pattern: /((?:^|\s)=?)(?:after|analysis|and|array|barchart|barwidth|begingraph|by|call|cas|cbarline|cfill|class(?:lev)?|close|column|computed?|contains|continue|data(?==)|define|delete|describe|document|do\s+over|do|dol|drop|dul|else|end(?:comp|source)?|entryTitle|eval(?:uate)?|exec(?:ute)?|exit|file(?:name)?|fill(?:attrs)?|flist|fnc|function(?:list)?|global|goto|group(?:by)?|headline|headskip|histogram|if|infile|keep|keylabel|keyword|label|layout|leave|legendlabel|length|libname|loadactionset|merge|midpoints|_?null_|name|noobs|nowd|ods|options|or|otherwise|out(?:put)?|over(?:lay)?|plot|print|put|raise|ranexp|rannor|rbreak|retain|return|select|session|sessref|set|source|statgraph|sum|summarize|table|temp|terminate|then\s+do|then|title\d?|to|var|when|where|xaxisopts|y2axisopts|yaxisopts)\b/i,
			lookbehind: true,
		};

		return {
			'datalines': {
				pattern: /^([ \t]*)(?:cards|(?:data)?lines);[\s\S]+?^[ \t]*;/im,
				lookbehind: true,
				alias: 'string',
				inside: {
					'keyword': {
						pattern: /^(?:cards|(?:data)?lines)/i
					},
					'punctuation': /;/
				}
			},

			'proc-sql': {
				pattern: /(^proc\s+(?:fed)?sql(?:\s+[\w|=]+)?;)[\s\S]+?(?=^(?:proc\s+\w+|data|quit|run);|(?![\s\S]))/im,
				lookbehind: true,
				inside: {
					'sql': {
						pattern: RegExp(/^[ \t]*(?:select|alter\s+table|(?:create|describe|drop)\s+(?:index|table(?:\s+constraints)?|view)|create\s+unique\s+index|insert\s+into|update)(?:<str>|[^;"'])+;/.source.replace(/<str>/g, function () { return stringPattern; }), 'im'),
						alias: 'language-sql',
						inside: 'sql'
					},
					'global-statements': globalStatements,
					'sql-statements': {
						pattern: /(^|\s)(?:disconnect\s+from|begin|commit|exec(?:ute)?|reset|rollback|validate)\b/i,
						lookbehind: true,
						alias: 'keyword'
					},
					'number': number,
					'numeric-constant': numericConstant,
					'punctuation': punctuation,
					'string': string
				}
			},

			'proc-groovy': {
				pattern: /(^proc\s+groovy(?:\s+[\w|=]+)?;)[\s\S]+?(?=^(?:proc\s+\w+|data|quit|run);|(?![\s\S]))/im,
				lookbehind: true,
				inside: {
					'comment': comment,
					'groovy': {
						pattern: RegExp(/(^[ \t]*submit(?:\s+(?:load|norun|parseonly))?)(?:<str>|[^"'])+?(?=endsubmit;)/.source.replace(/<str>/g, function () { return stringPattern; }), 'im'),
						lookbehind: true,
						alias: 'language-groovy',
						inside: 'groovy'
					},
					'keyword': keywords,
					'submit-statement': submitStatement,
					'global-statements': globalStatements,
					'number': number,
					'numeric-constant': numericConstant,
					'punctuation': punctuation,
					'string': string
				}
			},

			'proc-lua': {
				pattern: /(^proc\s+lua(?:\s+[\w|=]+)?;)[\s\S]+?(?=^(?:proc\s+\w+|data|quit|run);|(?![\s\S]))/im,
				lookbehind: true,
				inside: {
					'comment': comment,
					'lua': {
						pattern: RegExp(/(^[ \t]*submit(?:\s+(?:load|norun|parseonly))?)(?:<str>|[^"'])+?(?=endsubmit;)/.source.replace(/<str>/g, function () { return stringPattern; }), 'im'),
						lookbehind: true,
						alias: 'language-lua',
						inside: 'lua'
					},
					'keyword': keywords,
					'submit-statement': submitStatement,
					'global-statements': globalStatements,
					'number': number,
					'numeric-constant': numericConstant,
					'punctuation': punctuation,
					'string': string
				}
			},

			'proc-cas': {
				pattern: /(^proc\s+cas(?:\s+[\w|=]+)?;)[\s\S]+?(?=^(?:proc\s+\w+|quit|data);|(?![\s\S]))/im,
				lookbehind: true,
				inside: {
					'comment': comment,
					'statement-var': {
						pattern: /((?:^|\s)=?)saveresult\s[^;]+/im,
						lookbehind: true,
						inside: {
							'statement': {
								pattern: /^saveresult\s+\S+/i,
								inside: {
									keyword: /^(?:saveresult)/i
								}
							},
							[rest]: args
						}
					},
					'cas-actions': casActions,
					'statement': {
						pattern: /((?:^|\s)=?)(?:default|(?:un)?set|on|output|upload)[^;]+/im,
						lookbehind: true,
						inside: args
					},
					'step': step,
					'keyword': keywords,
					'function': func,
					'format': format,
					'altformat': altformat,
					'global-statements': globalStatements,
					'number': number,
					'numeric-constant': numericConstant,
					'punctuation': punctuation,
					'string': string
				}
			},

			'proc-args': {
				pattern: RegExp(/(^proc\s+\w+\s+)(?!\s)(?:[^;"']|<str>)+;/.source.replace(/<str>/g, function () { return stringPattern; }), 'im'),
				lookbehind: true,
				inside: args
			},
			/*Special keywords within macros*/
			'macro-keyword': macroKeyword,
			'macro-variable': macroVariable,
			'macro-string-functions': {
				pattern: /((?:^|\s|=))%(?:BQUOTE|NRBQUOTE|NRQUOTE|NRSTR|QUOTE|STR)\(.*?(?:[^%]\))/i,
				lookbehind: true,
				inside: {
					'function': {
						pattern: /%(?:BQUOTE|NRBQUOTE|NRQUOTE|NRSTR|QUOTE|STR)/i,
						alias: 'keyword'
					},
					'macro-keyword': macroKeyword,
					'macro-variable': macroVariable,
					'escaped-char': {
						pattern: /%['"()<>=¬^~;,#]/,
					},
					'punctuation': punctuation
				}
			},
			'macro-declaration': {
				pattern: /^%macro[^;]+(?=;)/im,
				inside: {
					'keyword': /%macro/i,
				}
			},
			'macro-end': {
				pattern: /^%mend[^;]+(?=;)/im,
				inside: {
					'keyword': /%mend/i,
				}
			},
			/*%_zscore(headcir, _lhc, _mhc, _shc, headcz, headcpct, _Fheadcz); */
			'macro': {
				pattern: /%_\w+(?=\()/,
				alias: 'keyword'
			},
			'input': {
				pattern: /\binput\s[-\w\s/*.$&]+;/i,
				inside: {
					'input': {
						alias: 'keyword',
						pattern: /^input/i,
					},
					'comment': comment,
					'number': number,
					'numeric-constant': numericConstant
				}
			},
			'options-args': {
				pattern: /(^options)[-'"|/\\<>*+=:()\w\s]*(?=;)/im,
				lookbehind: true,
				inside: args
			},
			'cas-actions': casActions,
			'comment': comment,
			'function': func,
			'format': format,
			'altformat': altformat,
			'numeric-constant': numericConstant,
			'datetime': {
				// '1jan2013'd, '9:25:19pm't, '18jan2003:9:27:05am'dt
				pattern: RegExp(stringPattern + '(?:dt?|t)'),
				alias: 'number'
			},
			'string': string,
			'step': step,
			'keyword': keywords,
			// In SAS Studio syntax highlighting, these operators are styled like keywords
			'operator-keyword': {
				pattern: /\b(?:eq|ge|gt|in|le|lt|ne|not)\b/i,
				alias: 'operator'
			},
			// Decimal (1.2e23), hexadecimal (0c1x)
			'number': number,
			'operator': /\*\*?|\|\|?|!!?|¦¦?|<[>=]?|>[<=]?|[-+\/=&]|[~¬^]=?/,
			'punctuation': punctuation
		};
	}
});
