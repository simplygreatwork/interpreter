
export const make_scope = (name, parent) => {
	
	const props = {}
	const fn = (key, value) => {
		if (value === undefined) return get(key)
		else return set(key, value)
	}
	fn.get = get
	fn.set = set
	fn.print = print
	fn.entries = entries
	return fn
	
	function get(key, level = 0) {
		
		if (key in props) return props[key]
		if (parent) return parent.get(key, level + 1)
		return undefined
	}
	
	function set(key, value, state, level = 0) {
		
		state = state || { updated: false }
		if (props[key] !== undefined) {
			props[key] = value
			state.updated = true
			return
		}
		if (parent) parent.set(key, value, state, level + 1)
		if (level == 0 && state.updated == false) props[key] = value
	}
	
	function print(level = 0) {
		
		if (parent) parent.print(level + 1)
		console.log(`print: ${level} ${JSON.stringify(props)}`)
	}
	
	function entries() {
		return Object.entries(props)
	}}
