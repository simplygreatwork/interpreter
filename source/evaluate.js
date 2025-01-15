
import { parse } from './parse.js'
import { expression } from './syntax.js'
import { make_scope } from './scope.js'

let trace = (value) => console.log(value)
trace = () => {}
const if_ = (subject, then, else_) => {
	if (subject) then(subject)
	else if (else_) else_(subject)
}

export const evaluate = (code, scope) => {
	
	scope = scope || make_scope()
	define_globals(scope, evaluate_)
	const node = parse(expression, code.trim())
	if (false) console.log(`node: ${JSON.stringify(node, null, 2)}`)
	return evaluate_(scope, node)
}

const evaluate_ = (scope, node, level = 0) => {
	
	if (scope('_stopped') === true) return
	if (node.type == 'caller') {
		if (node.value == 'do' && level > 0) return
		evaluate_caller(scope, node, level, node.value)
	} else {
		if (node.value !== undefined) node.result = node.value
	}
}

const evaluate_caller = (scope, node, level, caller) => {
	
	trace(`evaluate_caller: ${node.type} ${node.value}`)
	if_(scope(`${caller}:rescope`), init => scope = init(node.nodes, scope))
	if_(node.nodes, nodes => nodes.forEach(each => evaluate_(scope, each, level + 1)))
	if (caller == 'fn') return node.result = scope('fn')(node.nodes, scope)
	const fn = scope(caller)
	if (fn && typeof fn == 'function') node.result = fn.apply(null, [node.nodes.map(each => each.result), scope])
	else if (node.nodes.length == 0) node.result = scope('get')([caller], scope)
	else if (node.nodes.length == 1) scope('set')([caller, node.nodes[0].result], scope)
}

const define_globals = (scope, evaluate) => {
	
	if (false) scope('emit', scope => {})		// clobbers until can solve
	scope('fn:rescope', scope => make_scope('fn', scope))
	scope('fn', ([block], scope) => () => evaluate(scope, block))
	scope('print', (args) => console.log(args.join('')))
	scope('get', ([key], scope) => scope(key))
	scope('set', ([key, value], scope) => scope(key, value))
	scope('add', ([a, b]) => a + b)
	scope('sub', ([a, b]) => a - b)
	scope('mul', ([a, b]) => a * b)
	scope('div', ([a, b]) => a / b)
	scope('plus', scope('add'))
	scope('minus', scope('sub'))
	scope('times', scope('mul'))
	scope('divide', scope('div'))
	scope('inc', (a) => scope('add')([a, 1]))
	scope('increment', scope('inc'))
	scope('loop:rescope', (args, scope) => {
		scope = make_scope('loop', scope)
		scope('from', value => scope('from_', parseInt(value)))
		scope('to', value => scope('to_', parseInt(value)))
		scope('step', value => scope('step_', parseInt(value)))
		scope('does', args.at(-1))
		return scope
	})
	scope('loop', (args, scope) => {
		const from = scope('from_') || 0
		const to = scope('to_') || -1
		const step = scope('step_') || 1
		scope('i', from)
		scope('_looping', true)
		while (scope('_looping')) {
			evaluate(scope, scope('does'))
			if (scope('i') >= to) scope('_looping', false)
			scope('i', scope('i') + step)
		}
	})
	scope('break', (args, scope) => {
		scope('_looping', false)
		scope('_stopped', true)
	})
	scope('return', (args, scope) => {
		scope('_stopped', true)
	})
	scope('continue', (args, scope) => {
		console.log(`will continue`)
	})
	scope('if', () => {})
	scope('then', () => {})
	scope('else', () => {})
	scope('equals', () => {})
	scope('greater', () => {})
	scope('more', scope('greater'))
	scope('less', () => {})
	scope('group', () => {})
	scope('precident', scope('group'))
	scope('sine', value => Math.sin(value))
	scope('cosine', value => Math.cos(value))
	scope('object:rescope', (args, scope) => {
		scope = make_scope('object', scope)
		args.forEach((node) => scope(node.value, node.nodes[0].value))
		return scope
	})
	scope('object', (args, scope) => scope)
	scope('stringify', (args, scope) => {
		const scope_ = args[0]
		const pairs = scope_.entries().map(entry => `${entry[0]}:${entry[1]}`)
		return `{ ${pairs.join(', ')} }`
	})
	scope('so', (args, scope) => {
		scope = scope('object:rescope')(args, scope)
		scope = scope('object')(args, scope)
		return scope('stringify')([scope], scope)
		// otherwise prefered to be able to parse: stringify(object())
	})
	scope('list', () => {})
	scope('let', () => {})
	scope('const', () => {})
	scope('final', scope('const'))
}
