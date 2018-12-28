# Junior Challenges

## Into to all Challenges:

Good coders should learn one new language every year.

InfoSec folks are even used to learn one new language for every new problem they face (YMMV).

If you have not picked up a new challenge in 2018, you're in for a treat. 

We took the new and upcoming `Wee` programming language from paperbots.io. Big shout-out to Mario Zechner (@badlogicgames) at this point.

Some cool Projects can be created in Wee, like:
[this](https://paperbots.io/project.html?id=URJgCh), [this](https://paperbots.io/project.html?id=kpyyrl)
and [that](https://paperbots.io/project.html?id=F53thj).

Since we already know Java, though, we ported the server (Server.java and Paperbots.java) to Python (WIP) and constantly add awesome functionality.
Get the new open-sourced server at `/pyserver/server.py`.

Anything unrelated to the new server is left unchanged from commit `dd059961cbc2b551f81afce6a6177fcf61133292` at 
badlogics [paperbot github](https://github.com/badlogic/paperbots) (mirrored up to this commit [here](https://github.com/domenukk/paperbots/)).

We even added new features to this better server, like server-side Wee evaluation!

To make server-side Wee the language of the future, we already implemented awesome runtime functions. 
To make sure our VM is 100% safe and secure, there are also assertion functions in server-side Wee that you don't have to be concerned about. 


## Conversion Error
[MISC] Easy to Medium 

With `assert_string(str: string)`, we assert that our VM properly handles conversions. 
So far we never triggered the assertion and are certain it's impossible.


## DB Secret
[WEB] Medium

To enable secure microservices (or whatever, we don't know yet) over Wee in the future, we created a specific DB_SECRET, only known to us. This token is super important and extremely secret, hence the name.
The only way an attacker could get hold of it is to serve good booze to the admins.
Pretty sure it's otherwise well protected on our secure server.

## Decrypted

[Crypto] Medium

Did you know server-side Wee will supports a variety of crypto operations in the future?
How else could Wee ever catch up to other short-named languages like Go or all the Cs?
Anyway it's still in testing.
If you already want to take it for a spin, try `/wee/encryptiontest`.


## DEV/NULL

[MISC] Hard

We're not the first but definitely the latest to offer dev-null-as-a-service.
Pretty sure we're also the first to offer `Wee-piped-to-dev-null-as-a-service`[WPtDNaaS].
(We don't pipe anything, but the users don't care).
This service is more useful than most blockchains (old joke, we know).

Anyway this novel endpoint takes input at `/wee/dev/null` and returns nothing.

## EQUALITY ERROR

[MISC] Medium 

At `assert_equals(num: number)`, we've added an assert to make sure our VM properly handles equality. 
With only a few basic types, it's impossible to mess this one up, so the assertion has never been triggered. 
In case you do by accident, please report the output.


## Not Implemented

[Web] Hard++

NOT_IMPLEMENTED was not implemented nor intended.
Get it and profit.


## LAYERS

[MISC] Hard

An engineer added a special kind of token to our server: the LAYERS token is unique and there is no way to ever extract it.
This means, if anybody every searches for it on the internet or submits it here, we know we have, like, a mole, or something.

Dunno. Well we believe it cannot be extracted - so don't even bother.


## Localhost

[Web] Medium

We came up with some ingenious solutions to the problem of password reuse. 
For users, we don't use password auth but send around mails instead. This works well for humans but not for robots.
To make test automation possible, we didn't want to send those mails all the time, so instead we introduced the localhost header.
If we send a request to our server from the same host, our state-of-the-art python server sets the localhost header to a secret only known to the server.
This is bullet-proof, luckily.


## Logged In

[Web] Easy

Phew, we totally did not set up our mail server yet.
This is bad news since nobody can get into their accounts at the moment...
It'll be in our next sprint. 
Until then, since you cannot login: enjoy our totally finished software without account. 


## NUMBER ERROR

[Misc] Easy to Medium

The function `assert_number(num: number)` is merely a debug function for our Wee VM (WeeEm?).
It proves additions always work.
Just imagine the things that could go wrong if it wouldn't!


## WEE R LEET

[Misc] Easy

Somebody forgot a useless assert function in the interpreter somewhere. 
In our agile development lifecycle somebody added the function early on to prove it's possible.
Wev've only heared stories but apparently you can trigger it from Wee and it behaves differently for some "leet" input(?)
What a joker.
We will address this issue over the next few sprints.
Hopefully it doesn't do any harm in the meantime.


## WEE TOKEN

[Misc] Hard

We _need_ to make sure strings in Wee are also strings in our runtime.
Apparently attackers got around this and actively exploit us!
We do not know how.
Calling out to haxxor1, brocrowd, kobold.io,...:
if anybody can show us how they did it, please, please please submit us the token the VM will produce.
We added the function `assert_string(str: string)` for your convenience.

You might get rich - or not. 
It depends a bit on how we feel like and if you reach our technical support or just 1st level.
Anyway: this is a call to arms and a desperate request, that, we think, is usually called Bugs-Bunny-Program... or something?
 
Happy hacking.
