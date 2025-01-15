
import { parse } from './parse.js'
import { char } from './parse.js'
import { str } from './parse.js'
import { rep } from './parse.js'
import { alt } from './parse.js'
import { seq } from './parse.js'
import { opt } from './parse.js'
import { ref } from './parse.js'

const chars_double = char('-+\/\'\\\\=$:,<>!_.\(\)a-zA-Z0-9 \t')
const string_double = () => seq([str('"'), rep(chars_double, 0), str('"')], value => ({
	type: 'string',
	value: value.seq[1].rep.map(rep => rep.char).join('')
}))

const chars_single = char('-+\/\"\\\\=$:,<>!_.\(\)a-zA-Z0-9 \t')
const string_single = () => seq([str("'"), rep(chars_single, 0), str("'")], value => ({
	type: 'string',
	value: value.seq[1].rep.map(rep => rep.char).join('')
}))

const string = () => alt([string_single(), string_double()], value => value.alt)

// need to negate the integer
const number = () => seq([opt(str('-')), rep(char('0-9'), 1)], value => ({
	type: 'number',
	value: value.seq[1].rep.map(rep => rep.char).join('')
}))

const whitespace = () => rep(char('\t\r\n '), 1, value => ({
	type: 'whitespace',
	value: value.rep.map(rep => rep.char).join('')
}))

const chars_ = char('a-z_')
const symbol = () => seq([rep(chars_, 1)], value => ({
	type: 'symbol',
	value: value.seq[0].rep.map(rep => rep.char).join('')
}))

const print = (value) => console.log(JSON.stringify(value))
const assert = (state) => print(state)
const refs = {}

const contents = () => {
	return rep(alt([
		number(),
		string(),
		str(','),				// instead use fn: separator()
		whitespace(),
		ref(refs, 'expression'),
		symbol()
	]), 0)
}

export const expression = seq([
	symbol(),
	str('('),
	contents(),
	str(')'),
], value => ({
	type: 'caller',
	value: value.seq[0].value,
	nodes: value.seq[2].rep.map(r => r.alt).filter(each => {
		if (each.type == 'whitespace') return false
		if (each.str == ',') return false
		return true
	}),
}))

refs.expression = expression
