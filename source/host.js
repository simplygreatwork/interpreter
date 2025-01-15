
import { make_bus } from './bus.js'
import { make_scope } from './scope.js'
import { evaluate } from '../source/evaluate.js'

export const make_host = () => {
	
	const bus = make_bus()
	const scope = make_scope()
	const host = Object.assign({}, {
		configure: (fn) => fn(scope),
		evaluate: (code) => evaluate(code, scope),
		on: bus.on,
		emit: bus.emit
	})
	host.on('svg', value => console.log(`host.on: svg`))
	host.on('point', value => console.log(`host.on: point: ${JSON.stringify(value)}`))
	host.configure(scope => {
		scope('emit', ([key, value], scope) => {
			bus.emit(key, value)
		})
		scope('on', ([key]) => {})
	})
	return host
}
