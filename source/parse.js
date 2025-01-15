
const id = value => value
const valid = value => value instanceof Array

const make_state = (string, offset) => {
	
	const state = { string, offset }
	return Object.assign(state, {
		peek: (n) => state.string.slice(state.offset, state.offset + n),
		read: (n) => make_state(state.string, state.offset + n),
		is_complete: () => state.offset === state.string.length,
		is_state: true
	})
}

export const parse = (parser, string) => {
	
	const result = parser(make_state(string, 0))
	if (result && result[1] && result[1].is_complete()) {
		return result[0]
	} else {
		if (result && result.is_state) {
			return { error: result.offset }
		} else {
			return { error: true }
		}
	}
}

export const str = (string, f) => {
	
	f = f || id
	return function (state) {
		let chunk = state.peek(string.length)
		return chunk === string
			? [f({ str: chunk }), state.read(string.length)]
			: null
	}
}

export const char = (chars, f) => {
	
	f = f || id
	return function (state) {
		let chunk = state.peek(1)
		let regex = new RegExp('[' + chars + ']')
		return regex.test(chunk)
			? [f({ char: chunk }), state.read(1)]
			: null
	}
}

export const seq = (parsers, f) => {
	
	f = f || id
	return function (state) {
		let result = parsers.reduce(function (acc, parser) {
			if (!acc.success) { return acc }
			let parsed = parser(acc.state)
			if (valid(parsed)) {
				acc.matches.push(parsed[0])
				acc.state = parsed[1]
			} else {
				acc.success = false
			}
			return acc
		}, { success: true, state: state, matches: [] })
		return result.success
			? [f({ seq: result.matches }), result.state]
			: null
	}
}

export const rep = (parser, n, f) => {
	
	f = f || id
	return function (state) {
		let matches = []
		let lastState = null
		let parsed
		while (state) {
			lastState = state
			parsed = parser(state)
			if (valid(parsed)) {
				matches.push(parsed[0])
				state = parsed[1]
			} else {
				state = null
			}
		}
		return matches.length >= n
			? [f({ rep: matches }), lastState]
			: null
	}
}

export const opt = (parser, f) => {
	
	f = f || id
	return function(state) {
		let parsed = parser(state)
		return parsed
			? [f({ opt: parsed[0] }), parsed[1]]
			: [f({ opt: null }), state]
	}
}

export const alt = (parsers, f) => {
	
	f = f || id
	return function(state) {
		let result
		for (let i = 0, len = parsers.length; i < len; i += 1) {
			result = parsers[i](state)
			if (valid(result)) {
				return [f({ alt: result[0] }), result[1]]
			}
		}
		return null
	}
}

export const ref = (context, name) => {
	
	return function (state) {
		return context[name](state)
	}
}
