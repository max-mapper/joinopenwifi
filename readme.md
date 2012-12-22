# joinopenwifi

automatically join open and internet connected wireless networks on linux

## how it works

it uses `iwconfig` and `iwlist` to scan for nearby networks. then one at a time (in order of signal strength) it tries to connect to one and then checks to see if it can resolve the dns for `google.com`. if it can't then it moves on to the next network until it find one that is open and online.

## installation

`sudo npm install joinopenwifi -g`

(the `sudo` is necessary because changing wireless networks on linux requires superuser permissions)

this is tested on a raspberry pi. you will need to put node.js on it.
here are some notes on how https://gist.github.com/4322201

to run this script you should use a process monitor like mon/mongroup
so that it runs forever and ever and automatically on startup. see the notes
above for some examples of a mongroup script

I use this script with mongroup on a 1 minute delay so when it exits
mongroup restarts it, it waits 1 minute, then repeats. you could achieve
a similar result with cron but would have to figure out a way to make
sure multiple instances dont spawn (like a process lock file)

## usage

`sudo joinopenwifi <interface> <delay (milliseconds)> <verbose>`

optional arguments default to: `wlan0 0 true`

there is also a programmatic API. you can just require('joinopenwifi') and read index.js

the delay is so you can run this on startup and give linux a
chance to connect to a known network

## license

BSD