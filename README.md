# Redux-like State Management using Observables
An attempt to reverse-engineered state manager library with full typing support using TypeScript.

## Background Context
So I've been diving into this undocumented state-management library written in good ol' plain JavaScript. Let me tell you, it's been quite the adventure trying to figure out what the heck is going on in there! Back then, after a week of relentless exploration, I finally understand the code and got a handle on how this thing actually works.

Then I noticed:
> It's Redux but using Observable 

This library is basically Redux, but with a twist - it's using Observables! It brought back memories from four years ago using Redux. I can say that it was an unpleasent experience — so much boilerplate code.

Enough with the backstory. Now, I've decided to try reverse-engineer it. I'm also going to add some much-needed typing support to it while training my TypeScript skills.

## Behind the scene
This library uses [RxJS](https://rxjs.dev/)

When it comes to managing state in React, one common challenge is ensuring that all components stay in sync with the latest state updates. This is where `BehaviorSubject` comes to play.

I assume that they choose `BehaviorSubject` because it is well-suited for state management since it acts as a single source of truth that holds the current state value. It's a specialized implementation of the `Subject` class within RxJS. It emits the current value to any new subscribers, making it ideal for keeping components updated with the latest state information.

