
import { parse } from '../source/parse.js'
import { expression } from '../source/syntax.js'

let code
let result
code = `block(
	print('hello', "world", -333
	)
)`
code = `
block(
	import(make_object, make_array, from(file('./code')))
	import(make_object, make_array, from(url('http://')))
	import(from(file('./code')), make_object, make_array)
	import(from(url('http://')), make_object, make_array)
	
	set(o, make_object())
	o(const(make_object()))
	o(final(make_object()))
	set(of(o,'x'),1)
	set(of(of(o,'x'),'y'),1)
	set(x,add(mul(a,b),c))
	set(f,fn(a,b,do(
		add(a,b)
	))
	x(add(mul(a,b),c)))
	f(fn(a,b,add(a,b))
	f(fn(a,b,do(
		add(a,b)
	)))
	
	loop(from(-50),to(50),step(5),do(
		if(equals(i,5),break()),
		if(equals(i,5),then(break())),
		if(equals(i,5),then(
			break()
			return()
		), else(
			print(i)
		)),
		set(i,add(i,1)
		i(add(i,1))
		inc(i)
		return()
	))
)
`.trim()

code = `
block(
	import(make_object, make_array, from(file('./code')))
	import(make_object, make_array, from(url('http://')))
	import(from(file('./code')), make_object, make_array)
	import(from(url('http://')), make_object, make_array)
	set(o, make_object())
	o(const(make_object()))
	o(final(make_object()))
	set(of(o,'x'),1)
	set(of(of(o,'x'),'y'),1)
	set(x,add(mul(a,b),c))
	set(f,fn(a,b,block(
		add(a,b)
	)))
	x(add(mul(a,b),c))
	f(fn(a,b,add(a,b)))
	f(fn(a,b,block(
		add(a,b)
	)))
	loop(from(-50),to(50),step(5),block(
		if(equals(i,5),break()),
		if(equals(i,5),then(break())),
		if(equals(i,5),then(
			break()
			return()
		), else(
			print(i)
		)),
		set(i,add(i,1))
		i(add(i,1))
		inc(i)
		return()
	))
)
`.trim()
result = parse(expression, code)
console.log(`result: ${JSON.stringify(result, null, 2)}`)
