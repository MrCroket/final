
/*

  SmartClient Ajax RIA system
  Version v9.0p_2013-10-13/EVAL Deployment (2013-10-13)

  Copyright 2000 and beyond Isomorphic Software, Inc. All rights reserved.
  "SmartClient" is a trademark of Isomorphic Software, Inc.

  LICENSE NOTICE
     INSTALLATION OR USE OF THIS SOFTWARE INDICATES YOUR ACCEPTANCE OF
     ISOMORPHIC SOFTWARE LICENSE TERMS. If you have received this file
     without an accompanying Isomorphic Software license file, please
     contact licensing@isomorphic.com for details. Unauthorized copying and
     use of this software is a violation of international copyright law.

  DEVELOPMENT ONLY - DO NOT DEPLOY
     This software is provided for evaluation, training, and development
     purposes only. It may include supplementary components that are not
     licensed for deployment. The separate DEPLOY package for this release
     contains SmartClient components that are licensed for deployment.

  PROPRIETARY & PROTECTED MATERIAL
     This software contains proprietary materials that are protected by
     contract and intellectual property law. You are expressly prohibited
     from attempting to reverse engineer this software or modify this
     software for human readability.

  CONTACT ISOMORPHIC
     For more information regarding license rights and restrictions, or to
     report possible license violations, please contact Isomorphic Software
     by email (licensing@isomorphic.com) or web (www.isomorphic.com).

*/

if(window.isc&&window.isc.module_Core&&!window.isc.module_Foundation){isc.module_Foundation=1;isc._moduleStart=isc._Foundation_start=(isc.timestamp?isc.timestamp():new Date().getTime());if(isc._moduleEnd&&(!isc.Log||(isc.Log && isc.Log.logIsDebugEnabled('loadTime')))){isc._pTM={ message:'Foundation load/parse time: ' + (isc._moduleStart-isc._moduleEnd) + 'ms', category:'loadTime'};
if(isc.Log && isc.Log.logDebug)isc.Log.logDebug(isc._pTM.message,'loadTime');
else if(isc._preLog)isc._preLog[isc._preLog.length]=isc._pTM;
else isc._preLog=[isc._pTM]}isc.definingFramework=true;

if (window.isc && isc.version != "v9.0p_2013-10-13/EVAL Deployment") {
    isc.logWarn("SmartClient module version mismatch detected: This application is loading the core module from "
        + "SmartClient version '" + isc.version + "' and additional modules from 'v9.0p_2013-10-13/EVAL Deployment'. Mixing resources from different "
        + "SmartClient packages is not supported and may lead to unpredictable behavior. If you are deploying resources "
        + "from a single package you may need to clear your browser cache, or restart your browser."
        + (isc.Browser.isSGWT ? " SmartGWT developers may also need to clear the gwt-unitCache and run a GWT Compile." : ""));
}








//> @class Animation
// Class with static APIs used by the animation subsystem.
// @treeLocation  Client Reference/System
// @visibility animation_advanced
//<
isc.ClassFactory.defineClass("Animation");

isc.Animation.addClassProperties({
    //> @classAttr Animation.interval   (number : 40 : IRWA)
    // Interval in ms between animation events.
    // @visibility animation_advanced
    //<
    interval:40,
    registry:[],

    // Some standard ratio functions
    // These functions take a value between zero and one, representing a linear ratio and
    // return a value between zero and one that represents a non linear ratio.
    // Executed in global scope

    //> @classMethod Animation.smoothStart (A)
    // This is a static function which maps a linear ratio (value between zero and one
    // representing how much of an animation has elapsed) to a ratio biased such that the
    // starts slowly and speeds up as it approaches 1.
    // @visibility animation_advanced
    //<
    smoothStart : function (rawRatio) {
        return Math.pow(rawRatio, 2);
    },

    //> @classMethod Animation.smoothEnd (A)
    // This is a static function which maps a linear ratio (value between zero and one
    // representing how much of an animation has elapsed) to a ratio biased such that the
    // animation starts moving quickly, and appears to slow down as it approaches 1.
    // @visibility animation_advanced
    //<
    smoothEnd : function (rawRatio) {
        return 1 - Math.abs(Math.pow(rawRatio-1, 2));
    },

    //> @classMethod Animation.smoothStartEnd (A)
    // This is a static function which maps a linear ratio (value between zero and one
    // representing how much of an animation has elapsed) to a ratio biased such that the
    // animation appears to accelerate from a slow start, then slow down again toward the end
    // of the animation.
    // @visibility animation_advanced
    //<
    smoothStartEnd : function (rawRatio) {
        return (-Math.cos(rawRatio*Math.PI) + 1) / 2.0;
    },

    //> @classAttr Animation.animateTime (number : 1000 : IRWA)
    // Default total duration for animations with no specified duration.  Typically animations
    // involving canvases will pick up their duration from the Canvas level default, so this
    // property is only used in rare cases.
    // @visibility animation_advanced
    // @group animation
    //<
    animateTime:1000

});

isc.Animation.addClassMethods({
    // Unique IDs used to identify registered animation actions
    generateAnimationID : function () {
        if (!this._animationCount) this._animationCount = 0;
        return "_" + (this._animationCount++);
    },

    // Raw handler fired in the global scope by the animation timer - fires the animation
    // events
    timeoutAction : function () {
        if (isc.Animation) isc.Animation.fireTimer();
    },

    //> @type AnimationAcceleration
    // Acceleration effect for animations. Can either be a ratio function or a string.
    // Ratio functions take a value between 0 and 1 which represents how much of the
    // animation's duration has elapsed, and return another value between 0 and 1 indicating
    // how close the animation is to completion. For a completely linear animation, the
    // function would return the value it was passed. This allows you to bias animations to
    // [for example] speed up toward the end of the animation.<br>
    // The following strings are also supported for common ratio bias effects:
    //
    // @value "smoothStart" - animation will speed up as time elapses
    // @value "smoothEnd" - animation will slow down as time elapses
    // @value "smoothStartEnd" - animation will speed up in the middle
    // @value "none" - no bias
    // @visibility animation
    //<

    //> @classMethod Animation.registerAnimation()
    // Register an action to fire repeatedly for some duration of time.
    //
    // @param callback (callback) Action to fire repeatedly until the duration expires.
    //                            Passed 3 parameters for each step:<br>
    //                              - "ratio" (number between 0 and 1) indicating what fraction
    //                                of the specified duration has elapsed<br>
    //                              - "ID" (string) the unique ID for this registered animation<br>
    //                              - "earlyFinish" (boolean) If true this animation was cut
    //                                short via a call to +link{Animation.finishAnimation()} before
    //                                its duration had elapsed.
    // @param duration (number) Target duration for this animation in ms.  The callback will
    //                          actually be called a fixed number of times based on this target
    //                          duration and the default frame interval
    //                          (isc.Animation.interval), which may result in an animation that
    //                          is longer than the target duration if some frames exceed the
    //                          interval time.  The animation will be cut short if it exceeds
    //                          3 times the target duration
    // @param [acceleration] (AnimationAcceleration) Acceleration bias effect for the animation.
    // @param [target] (object) If specified the callback will be fired in the scope of the
    //                          target passed in.
    // @return (string) Unique ID for the registered animation action.
    // @visibility animation_advanced
    //<
    registerAnimation : function (callback, duration, acceleration, target) {
        if (!this._animationTimer) {
            this._animationTimer = isc.Timer.setTimeout(this.timeoutAction, this.interval);
            this._startTime = isc.timeStamp();
        }
        if (!target) target = this;
        if (!duration) duration = this.animateTime;


        if (isc.isA.String(acceleration)) {
            if (!isc.Animation.accelerationMap) {
                isc.Animation.accelerationMap =  {
                    smoothStart:isc.Animation.smoothStart,
                    smoothEnd:isc.Animation.smoothEnd,
                    smoothStartEnd:isc.Animation.smoothStartEnd
                    // Support the user specifying "none" - just don't use any biasing
                    // function - same as if they said "foo"
                    // none:null
                }
            }
            acceleration = isc.Animation.accelerationMap[acceleration];
        }

        var ID = this.generateAnimationID();
        this.registry.add({
            ID:ID, target:target, callback:callback, duration:duration, elapsed:0,
            totalFrames:Math.round(duration/this.interval), currentFrame:0,
            // For frame based animation (the default), don't allow animation to exceed
            // three times the specified duration.
            maxDuration:duration*3,
            acceleration:acceleration
        });

        return ID;
    },

    //> @classMethod Animation.clearAnimation()
    // Clear a registered animation action. Only meaningful if the registered animation has
    // not completed (i.e. the specified duration for the action has not elapsed since the
    // action was registered). Will un-register the action and prevent it from firing again.
    // @param ID (string) ID for the action to be unregistered. This is the ID returned from
    //                      Animation.registerAnimation().
    // @visibility animation_advanced
    //<
    clearAnimation : function (ID) {
        for (var i=0; i<this.registry.length; i++) {
            if (this.registry[i] && this.registry[i].ID == ID) {
                this.registry.removeAt(i);
                break;
            }
        }
    },

    //> @classMethod Animation.finishAnimation()
    // "Finish" a registered animation, by clearing it, and firing it with a
    // ratio of 1 and an additional 'earlyFinish' which will be passed to the callback.
    // @param ID (string) ID for the action to be finished. This is the ID returned from
    //                      Animation.registerAnimation().
    // @visibility animation_advanced
    //<
    finishAnimation : function (ID) {
        for (var i = 0; i < this.registry.length; i++) {
            if (this.registry[i] && this.registry[i].ID == ID) {
                var entry = this.registry[i];
                break;
            }
        }

        this.clearAnimation(ID);
        if (entry) this.fireAction(entry, 1, true);
    },

    // fireTimer() - this is fired every interval and handles:
    // - firing any animations whose total duration has not yet elapsed
    // - unregistering any animations whose total duration has elapsed
    // - setting up the timer to fire this method again after the next Animation.interval ms
    fireTimer : function () {
        var newTime = isc.timeStamp(),
            elapsed = (newTime - this._startTime),
            // Adjust for the difference between the actual elapsed time and the desired
            // interval so we average out to firing as close to every [interval] ms as possible
            interval = Math.max(0, this.interval - (elapsed - this.interval));

        //this.logWarn("timer firing - elapsed is:"+ elapsed + ", so interval is:"+ interval);
        this._animationTimer = isc.Timer.setTimeout(this.timeoutAction, interval);
        this._startTime = newTime;

        for (var i = 0; i < this.registry.length; i++) {
            var entry = this.registry[i];
            // We don't expect this to happen because we do a removeEmpty below

            if (entry == null) continue;

            entry.elapsed += elapsed;
            var nextFrame = entry.currentFrame + 1;


            if (!isc.Animation.timeBased &&
                ((entry.elapsed / entry.maxDuration) > (nextFrame / entry.totalFrames) ))
            {
                nextFrame = Math.min(entry.totalFrames,
                                     Math.ceil((entry.elapsed/entry.maxDuration) * entry.totalFrames));
            }

            entry.currentFrame = nextFrame;

            var unbiasedRatio = isc.Animation.timeBased
                                ? entry.elapsed/entry.duration
                                : entry.currentFrame/entry.totalFrames;

            var ratio = unbiasedRatio,
                acceleration = entry.acceleration;
            if (acceleration && isc.isA.Function(acceleration)) {


                try {
                    ratio = entry.acceleration(ratio);
                } catch(e) {
                    this.logWarn("Custom ratio function for animation:" + isc.Log.echoAll(entry) +
                                 "\nCaused an error:"+ (e.message ? e.message : e));
                    // delete it, so even if its time hasn't elapsed we don't run into this error
                    // repeatedly until the time expires
                    entry.acceleration = null;
                }
            }
            //this.logWarn("ratio:"+ ratio);

            // If we've fired the animation for the duration of the entry, ensure we clear it
            // out so we don't fire it again
            // Note that we are checking the unbiased ratio - the acceleration is arbitrary, so
            // may fail to give us a value of 1, in which case we don't want to be left with
            // an incompleted animation.
            if (unbiasedRatio >= 1) {
                ratio = 1;
                this.registry[i] = null;
            }


            var error = null;
            try {
                //this.logWarn("firing frame of animation: " + entry.ID + " with ratio: " + ratio);
                error = this.fireAction(entry, ratio);
            } catch(e) {
                error = e;
            }
            if (error != null) {
                this.logWarn("Attempt to fire registered animation:" + isc.Log.echoAll(entry) +
                 "\nCaused an error:"+ (error.message ? error.message : error));
                // delete it, so even if its time hasn't elapsed we don't run into this error
                // repeatedly until the time expires
                this.registry[i] = null;
            }

            if (unbiasedRatio >= 1) {
                this.logDebug("animation " + entry.ID + " completed", "animation");
            }
        }
        this.registry.removeEmpty();
        // Stop looping if we don't have any pending animations
        if (this.registry.length == 0) {
            isc.Timer.clearTimeout(this._animationTimer);
            this._animationTimer = null;
        }
    },

    // fireAction will be called to actually fire each registered animation action
    _$ratio_ID_earlyFinish:"ratio,ID,earlyFinish",
    fireAction : function (action, ratio, earlyFinish) {

        // pass the earlyFinish param on to the action callback.

        var target = action.target;
        if (!target || target.destroyed) {
            return "No valid target. Target may have been destroyed since animation commenced";
        }
        target.fireCallback(action.callback, this._$ratio_ID_earlyFinish,
                            [ratio,action.ID,earlyFinish]);
    },

    // Globally are any animations in progress?

    isActive : function () {
        return (this.registry && this.registry.length > 0);
    }
});

isc.Canvas.addProperties({
    //> @attr canvas.animateTime (number : 300 : IRWA)
    // Default total duration of animations. Can be overridden by setting animation times for
    // specific animations, or by passing a <code>duration</code> parameter into the appropriate
    // animate...() method.
    // @visibility animation
    // @group animation
    // @example animateMove
    //<

    animateTime:300,

    //> @attr canvas.animateAcceleration (AnimationAcceleration : "smoothEnd" : IRWA)
    // Default acceleration effect to apply to all animations on this Canvas.
    // Can be overridden by setting animationAcceleration for specific animations or by passing
    // an acceleration function directly into the appropriate method.
    // @visibility animation
    // @group animation
    //<
    animateAcceleration:"smoothEnd",

    // List of supported animations.
    // For each of these we need to support the method 'animate[Type]' (like animateMove()).
    // These method names can also be passed as parameters to finishAnimation()

    _animations:["rect","fade","scroll","show","hide"],

    //> @attr canvas.animateShowEffect (animateShowEffectId | animateShowEffect : "wipe" : IRWA)
    // Default animation effect to use if +link{Canvas.animateShow()} is called without an
    // explicit <code>effect</code> parameter
    // @visibility animation
    // @group animation
    //<
    animateShowEffect:"wipe",

    //> @attr canvas.animateHideEffect (animateShowEffectId | animateShowEffect : null : IRWA)
    // Default animation effect to use if +link{Canvas.animateHide()} is called without an
    // explicit <code>effect</code> parameter
    // @visibility animation
    // @group animation
    //<
    animateHideEffect:"wipe"

    //> @attr canvas.animateMoveTime  (number : null : IRWA)
    // Default time for performing an animated move.  If unset, <code>this.animateTime</code>
    // will be used by default instead
    // @visibility animation
    // @group animation
    //<

    //> @attr canvas.animateResizeTime  (number : null : IRWA)
    // Default time for performing an animated resize.  If unset, <code>this.animateTime</code>
    // will be used by default instead
    // @visibility animation
    // @group animation
    //<

    //> @attr canvas.animateRectTime  (number : null : IRWA)
    // Default time for performing an animated setRect.  If unset, <code>this.animateTime</code>
    // will be used by default instead
    // @visibility animation
    // @group animation
    //<

    //> @attr canvas.animateFadeTime  (number : null : IRWA)
    // Default time for performing an animated fade.  If unset, <code>this.animateTime</code>
    // will be used by default instead
    // @visibility animation
    // @group animation
    //<

    //> @attr canvas.animateScrollTime  (number : null : IRWA)
    // Default time for performing an animated scroll.  If unset, <code>this.animateTime</code>
    // will be used by default instead
    // @visibility animation
    // @group animation
    //<

    //> @attr canvas.animateShowTime  (number : null : IRWA)
    // Default time for performing an animated show.  If unset, <code>this.animateTime</code>
    // will be used by default instead
    // @visibility animation
    // @group animation
    //<

    //> @attr canvas.animateHideTime  (number : null : IRWA)
    // Default time for performing an animated hide.  If unset, <code>this.animateTime</code>
    // will be used by default instead
    // @visibility animation
    // @group animation
    //<

    //> @attr canvas.animateMoveAcceleration  (AnimationAcceleration : null : IRWA)
    // Default acceleration effect for performing an animated move.  If unset,
    // <code>this.animateAcceleration</code> will be used by default instead
    // @visibility animation
    // @group animation
    //<

    //> @attr canvas.animateResizeAcceleration  (AnimationAcceleration : null : IRWA)
    // Default acceleration function for performing an animated resize.  If unset,
    // <code>this.animateAcceleration</code> will be used by default instead
    // @visibility animation
    // @group animation
    //<

    //> @attr canvas.animateRectAcceleration  (AnimationAcceleration : null : IRWA)
    // Default acceleration function for performing an animated move and resize.  If unset,
    // <code>this.animateAcceleration</code> will be used by default instead
    // @visibility animation
    // @group animation
    //<

    //> @attr canvas.animateScrollAcceleration  (AnimationAcceleration : null : IRWA)
    // Default acceleration function for performing an animated scroll.  If unset,
    // <code>this.animateAcceleration</code> will be used by default instead
    // @visibility animation
    // @group animation
    //<

    //> @attr canvas.animateShowAcceleration  (AnimationAcceleration : null : IRWA)
    // Default acceleration function for performing an animated show.  If unset,
    // <code>this.animateAcceleration</code> will be used by default instead
    // @visibility animation
    // @group animation
    //<

    //> @attr canvas.animateHideAcceleration  (AnimationAcceleration : null : IRWA)
    // Default acceleration function for performing an animated hide.  If unset,
    // <code>this.animateAcceleration</code> will be used by default instead
    // @visibility animation
    // @group animation
    //<



})

isc.Canvas.addMethods({

    //> @method canvas.registerAnimation  (A)
    // Register some action to fire repeatedly for a specified duration
    // @param callback (callback) Action to fire repeatedly until the duration expires
    // @param [duration] (Integer) time in ms for which the action should be fired
    // @param [acceleration] (AnimationAcceleration) Acceleration effect to apply to the animation
    // @return (string) Unique identifier for the registered animation action
    // @visibility animation_advanced
    // @group animation
    //<
    registerAnimation : function (callback, duration, acceleration) {
        if (!acceleration) acceleration = this.animationAcceleration;
        if (!duration) duration = this.animateTime;
        return isc.Animation.registerAnimation(callback, duration, acceleration, this);
    },

    //> @method canvas.cancelAnimation  (A)
    // Clear some registered animation action
    // @param ID (string) ID of the animation as returned by canvas.registerAnimation()
    // @visibility animation_advanced
    // @group animation
    //<
    cancelAnimation : function (ID) {
        isc.Animation.clearAnimation(ID);
    },

    // ----------------------------------------------------------------------------------------
    // Specific animation effects (Higher level API)
    // ----------------------------------------------------------------------------------------

    // getAnimationType() will return the default duration for various animation types
    // getAnimationAcceleration() will return the default acceleration function used to bias
    // animation ratios for the appropriate type
    _animateTimeMap:{},
    _animateAccelerationMap:{},
    getAnimateTime : function (type) {
        if (!isc.isA.String(type) || isc.isAn.emptyString(type)) return this.animateTime;

        // type is something like "move" or "resize"
        // - default duration specified via this.animateMoveTime
        if (!this._animateTimeMap[type]) {
            this._animateTimeMap[type] = "animate" +
                                            type.substring(0,1).toUpperCase() + type.substring(1) +
                                            "Time";
        }
        return this[this._animateTimeMap[type]] || this.animateTime;
    },

    getAnimateAcceleration : function (type) {
        if (!isc.isA.String(type) || isc.isAn.emptyString(type)) return this.animateAcceleration;

        // - default ratio biasing function specified via this.animate[Type]Acceleration
        if (!this._animateAccelerationMap[type]) {
            this._animateAccelerationMap[type] = "animate" +
                                            type.substring(0,1).toUpperCase() + type.substring(1) +
                                            "Acceleration";
        }
        return this[this._animateAccelerationMap[type]] || this.animateAcceleration;
    },

    // _getAnimationIDs() - each time an animation is set up, the ID of the animation action
    // is stored under this.[type]Animation (so this.rectAnimation, this.fadeAnimation, etc.)
    // Helper method to retrieve these IDs
    _animationIDs:{},
    _$Animation:"Animation",
    _getAnimationID : function (type) {
        if (!this._animationIDs[type]) {
            this._animationIDs[type] = type + this._$Animation;
        }
        return this._animationIDs[type];
    },
    // _getAnimationMethodName() - the actions fired (repeatedly) for animations are canonically
    // named as this.fireAnimation[ActionType]().
    // Helper to cache / retrieve these names
    _animationMethodNames:{},
    _getAnimationMethodName : function (type) {
        if (!this._animationMethodNames[type]) {
            this._animationMethodNames[type] = "fireAnimation" +
                                                type.substring(0,1).toUpperCase() +
                                                type.substring(1);
        }
        return this._animationMethodNames[type];
    },

    // Helper method fired to start an animation. This method allows us to consolidate the
    // code path to:
    // - check if a current animation is in process (and finish it if so)
    // - store out info for use by repeatedly called animation action
    // - registers the animation to actually start firing
    // This method requires the following:
    // - the repeatedly fired action for an animation will be named "this.fireAnimation[AnimationType]"
    // - the info passed to this method will be stored as "this.[animationType]Info" (so the
    //   action should be prepared to access that object)
    // - the ID of the registered animation will be stored as "this.[animationType]Animation"
    // - When the animation completes, the method _clearAnimationInfo() should be called to
    //   clear out the stored animation ID and info. This is handled by the various
    //   fireAnimation... methods when the animation is complete (ratio == 1), and typically
    //   before the final callback fires to ensure isAnimating(..) is false at that point.

    _animationInfoAttrs:{},
    _runningAnimations:0,
    _startAnimation : function (type, info, duration, acceleration) {
        var ID = this._getAnimationID(type);
        // If an animation of the same type is already running, finish it before starting this
        // one.
        if (this[ID]) this.finishAnimation(type);

        // Hang onto the info passed in - will be used by the animation action fired
        if (!this._animationInfoAttrs[type]) {
            // NB: using $ instead of _ prefix to avoid obfuscation problems
            this._animationInfoAttrs[type] = "$" + type + "AnimationInfo";
        }
        this[this._animationInfoAttrs[type]] = info;

        if (duration == null) duration = this.getAnimateTime(type);
        if (acceleration == null) acceleration = this.getAnimateAcceleration(type);

        // Register the animation method to fire for the specified duration
        var animationId = this[ID] =
            this.registerAnimation(this[this._getAnimationMethodName(type)], duration, acceleration);
        if (this.logIsInfoEnabled("animation")) {
            this.logInfo("starting animation " + animationId + " of type: " + type +
                         ", duration: " + duration +
                         ", acceleration: " + this.echoLeaf(acceleration),
                         "animation");
        }
        this._runningAnimations ++;

        return animationId;
    },

    _clearAnimationInfo : function (type) {
        var ID = this._getAnimationID(type);
        if (!this[ID]) {
            return;
        }
        delete this[ID];
        delete this[this._animationInfoAttrs[type]];

        this._runningAnimations--;

    },

    // helper method to fire the final callback at the end of an animation.

    animationComplete : function (earlyFinish) {},
    _fireAnimationCompletionCallback : function (callback, earlyFinish, synchronous) {
        if (!callback) return;

        var widget = this;
        var fireCallback = function () {
            widget.fireCallback(callback, "earlyFinish", [earlyFinish]);
            widget.animationComplete(earlyFinish);
        }



        if (earlyFinish || synchronous) {
            fireCallback();
        } else {
            isc.Timer.setTimeout(fireCallback, 0);
        }
    },

    //> @method canvas.finishAnimation()
    // Forces a running animation (animated move / resize, etc.) to instantly complete - jumping
    // to its finished state, and firing its callback, and passing the 'earlyFinish' parameter
    // to the callback.
    // @param [type] (string) animation type name ("move", "resize", etc). If not passed just
    //                        finish all animations
    // @visibility internal
    // @group animation
    //<

    finishAnimation : function (type) {

        // if type is null finish animations of all types
        if (type == null) {
            for (var i = 0 ; i < this._animations.length; i++) {
                this.finishAnimation(this._animations[i]);
            }
            return;
        }

        // Every animation stores it's currently registered animation as this.[type]Animation
        // If we're not currently performing an animation of this type no need to proceed
        var ID = this._getAnimationID(type);
        if (!this[ID]) return;

        // Call 'finishAnimation' directly on the Animation class. This will cancel further
        // animations and fire the animation action with a ratio of 1, passing in the
        // 'earlyFinish' parameter.
        if (this.logIsInfoEnabled("animation")) {
            this.logInfo("manual finish for animations: " + this.echoAll(this[ID]) +
                          (this.logIsDebugEnabled("animation") ? this.getStackTrace() : ""),
                          "animation");
        }

        isc.Animation.finishAnimation(this[ID]);
    },

    // --------------------------------
    // Developer visible APIS:

    //> @method Callbacks.AnimationCallback
    // A +link{type:Callback} called when the move completes.
    //
    // @param earlyFinish (boolean)  parameter will be passed if the animation was
    //                               cut short by a call to finishAnimation
    //
    // @visibility external
    //<

    //> @method canvas.animateMove()
    // Animate a reposition of this canvas from its current position to the specified position
    // @param left (Integer) new left position (or null for unchanged)
    // @param top (Integer) new top position (or null for unchanged)
    // @param [callback] (AnimationCallback) When the move completes this callback will be fired. Single
    //                            'earlyFinish' parameter will be passed if the animation was
    //                            cut short by a call to finishAnimation
    // @param [duration] (Integer) Duration in ms of the animated move
    // @param [acceleration] (AnimationAcceleration) Optional acceleration effect to bias the ratios
    // @visibility animation
    // @group animation
    // @example animateMove
    //<

    _$move:"move",
    animateMove : function (left, top, callback, duration, acceleration) {
        return this.animateRect(left, top, null, null, callback, duration,
                                acceleration, this._$move);
    },
    fireAnimationMove : function (ratio, ID, earlyFinish) {
        // pass along the additional "type" parameter
        return this.fireAnimationRect(ratio, ID, earlyFinish, this._$move);
    },

    //> @method canvas.animateResize()
    // Animate a resize of this canvas from its current size to the specified size
    // @param width (Integer) new width (or null for unchanged)
    // @param height (Integer) new height (or null for unchanged)
    // @param [callback] (AnimationCallback) When the resize completes this callback will be fired. Single
    //                              'earlyFinish' parameter will be passed if the animation was
    //                              cut short by a call to finishAnimation
    // @param [duration] (Integer) Duration in ms of the animated resize
    // @param [acceleration] (AnimationAcceleration) Optional acceleration effect to apply to the resize
    // @visibility animation
    // @group animation
    // @example animateResize
    //<
    _$resize:"resize",
    animateResize : function (width, height, callback, duration, acceleration) {
        return this.animateRect(null, null, width, height, callback, duration, acceleration,
                                    this._$resize);
    },
    fireAnimationResize : function (ratio, ID, earlyFinish) {
        // pass along the additional 'type' parameter
        return this.fireAnimationRect(ratio, ID, earlyFinish, this._$resize);
    },

    //> @method canvas.animateRect()
    // Animate a reposition / resize of this canvas from its current size and position.
    // @param left (Integer) new left position (or null for unchanged)
    // @param top (Integer) new top position (or null for unchanged)
    // @param width (Integer) new width (or null for unchanged)
    // @param height (Integer) new height (or null for unchanged)
    // @param [callback] (AnimationCallback) When the setRect completes this callback will be fired. Single
    //                              'earlyFinish' parameter will be passed if the animation was
    //                              cut short by a call to finishAnimation
    // @param [duration] (Integer) Duration in ms of the animated setRect
    // @param [acceleration] (AnimationAcceleration) Optional acceleration effect to apply to the animation
    // @visibility animation
    // @group animation
    // @example animateZoom
    //<
    // Additional type parameter allows us to pick up default durations for animated
    // move / resizes, which fall through to this method

    _$rect:"rect",
    animateRect : function (left, top, width, height, callback, duration, acceleration, type) {
        if (type == null) {
            type = this._$rect;
            // when starting a new "rect" animation, we need to finish any currently running
            // "resize", "move", or "rect" animations.  "rect" animations will automatically be
            // killed by starting a new "rect" animation (in _startAnimation()), but we have to
            // kill "resize" or "move" animations here directly
            if (this.resizeAnimation != null) this.finishAnimation(this._$resize);
            if (this.moveAnimation != null) this.finishAnimation(this._$move);
        }

        // This info object will be available to the repeatedly fired animation action as
        // this.$rectAnimationInfo
        var info = {_fromRect:this.getRect(), _left:left, _top:top, _width:width, _height:height,
                    _callback:callback};
        // call this._startAnimation() to handle actually setting up the animation.
        return this._startAnimation(type, info, duration, acceleration);
    },

    // fireAnimationRect() - fired repeatedly on a timer as the setRect animation proceeds
    // when ratio == 1 the animation is complete
    // Note: we rely on this naming scheme "fireAnimation[AnimationType]"
    // in '_startAnimation()' / 'finishAnimation()'
    fireAnimationRect : function (ratio, ID, earlyFinish, type) {


        var info = (type == this._$resize ? this.$resizeAnimationInfo :
                    (type == this._$move ? this.$moveAnimationInfo : this.$rectAnimationInfo)),
            fromRect = info._fromRect,
            toLeft = info._left, toTop = info._top,
            toWidth = info._width, toHeight = info._height,

            left =
                toLeft != null ? this._getRatioTargetValue(fromRect[0], toLeft, ratio) : null,
            top =
                toTop != null ? this._getRatioTargetValue(fromRect[1], toTop, ratio) : null;

        // hueristic for smooth enlarge/shrink and similar animations: during eg a shrink from
        // all 4 corners, we are increasing left while shrinking width.  In order for centered
        // content within the rect to stay at a stable position, width must shrink by exactly
        // double what left changes by.  This won't happen if we do separate
        // (ratio * difference) calculations, no matter if we use Math.round,ceil,or floor.
        // Instead, if width and left or height and top are both changing and are an even
        // multiple of each other, use a multiple of left's delta for width instead of
        // calculating the width delta separately (likewise for top/height).
        var width, height;
        if (toWidth != null && left != null && (toLeft - fromRect[0] != 0)) {
            var sideRatio = (toWidth - fromRect[2]) / (toLeft - fromRect[0]);
            if (Math.floor(sideRatio) == sideRatio) {
                //this.logWarn("using ratio: " + sideRatio +
                //             ", fromRect: " + fromRect +
                //             ", toLeft,toWidth: " + [toLeft,toWidth] +
                //             ", on delta: " + (left - fromRect[0]));
                width = fromRect[2] + (sideRatio * (left - fromRect[0]))
            }
        }
        if (toHeight != null && top != null && (toTop - fromRect[1] != 0)) {
            var sideRatio = (toHeight - fromRect[3]) / (toTop - fromRect[1]);
            if (Math.floor(sideRatio) == sideRatio) {
                height = fromRect[3] + (sideRatio * (top - fromRect[1]))
            }
        }
        if (width == null && toWidth != null) {
            width = this._getRatioTargetValue(fromRect[2], toWidth, ratio);
        }
        if (height == null && toHeight != null) {
            height = this._getRatioTargetValue(fromRect[3], toHeight, ratio);
        }

        if (ratio == 1) {
            if (type == null) type = "rect";
            this._clearAnimationInfo(type);
        }
        // Pass in the additional 'animating' param.
        // - avoids setRect from relaying out children
        // - notifies it that this is not an external setRect call in the middle of an
        //   animation.

        //this.logWarn("ratio: " + ratio + ", animateRect: " + [left,top,width,height]);

        this.setRect(left, top, width, height, (ratio < 1));

        if (this.isDirty()) this.redraw("animated resize");

        if (ratio == 1) {
            this._fireAnimationCompletionCallback(info._callback, earlyFinish);
        }
    },

    // A very common pattern in our animations is to step incrementally from one value to
    // another.
    _getRatioTargetValue : function (from, to, ratio) {
        // Common thing - a null 'to' indicates no change
        if (to == null) return from;
        return (from + Math.floor(ratio * (to - from)));
    },


    //> @method canvas.animateFade()
    // Animate a change in opacity from the widget's current opacity to the specified opacity.
    // @param opacity (Integer) desired final opacity
    // @param [callback] (AnimationCallback) When the fade completes this callback will be fired. Single
    //                              'earlyFinish' parameter will be passed if the animation was
    //                              cut short by a call to finishAnimation
    // @param [duration] (Integer) Duration in ms of the animated fade
    // @param [acceleration] (AnimationAcceleration) Optional animation acceleration to bias the ratios
    // @visibility animation
    // @group animation
    // @example animateFade
    //<
    animateFade : function (opacity, callback, duration, acceleration) {

        // if we're undrawn, just set the opacity instantly.
        if (!this.isDrawn()) {
            this.setOpacity(opacity);
            this._fireAnimationCompletionCallback(callback, true);
            return;
        }

        if (this.visibility == isc.Canvas.HIDDEN) {
            this.setOpacity(0);
            this.show();
        }
        // opacity of 'null' implies default - 100%
        if (opacity == null) opacity = 100;
        var info = {_fromOpacity:this.opacity != null ? this.opacity : 100,
                    _toOpacity:opacity, _callback:callback};
        return this._startAnimation("fade", info, duration, acceleration)
    },

    // fireAnimationFade() - fired repeatedly to perform an animation fade.
    fireAnimationFade : function (ratio, ID, earlyFinish) {
        var info = this.$fadeAnimationInfo,
            fromOpacity = info._fromOpacity,
            toOpacity = info._toOpacity;

        var opacity = this._getRatioTargetValue(fromOpacity, toOpacity, ratio);

        if (isc.Browser.isIE && opacity > 0 && !info._toggledVis && !isc.Browser.isIE9) {
            var styleHandle = this.getStyleHandle();
            if (styleHandle) {
                styleHandle.visibility = isc.Canvas.VISIBLE;
                styleHandle.visibility = isc.Canvas.INHERIT;
            }
            // we also need to toggle visibility of any peers which get faded with the master!
            var peers = this.peers;
            if (peers && peers.length > 0) {
                for (var i = 0; i < peers.length; i++) {
                    if (peers[i]._setOpacityWithMaster) {
                        var styleHandle = peers[i].getStyleHandle();
                        if (styleHandle) {
                            styleHandle.visibility = isc.Canvas.VISIBLE;
                            styleHandle.visibility = isc.Canvas.INHERIT;
                        }
                    }
                }
            }

            info._toggledVis = true;
        }


        if (ratio == 1) {
            this._clearAnimationInfo("fade");
        }
        this.setOpacity(opacity, (ratio < 1));
        if (ratio == 1) this._fireAnimationCompletionCallback(info._callback, earlyFinish);
    },


    //> @method canvas.animateScroll()
    // Animate a scroll from the current scroll position to the specified position.
    // @param scrollLeft (Integer) desired final left scroll position
    // @param scrollTop (Integer) desired final top scroll position
    // @param [callback] (AnimationCallback) When the scroll completes this callback will be fired. Single
    //                              'earlyFinish' parameter will be passed if the animation was
    //                              cut short by a call to finishAnimation
    // @param [duration] (Integer) Duration in ms of the animated scroll
    // @param [acceleration] (AnimationAcceleration) Optional acceleration to bias the animation ratios
    // @visibility animation
    // @group animation
    //<
    animateScroll : function (scrollLeft, scrollTop, callback, duration, acceleration) {
        var overflow = this.overflow;
        if (this.overflow == isc.Canvas.VISIBLE) return;

        var info = {_fromLeft:this.getScrollLeft(), _fromTop:this.getScrollTop(),
                    _toLeft:scrollLeft, _toTop:scrollTop, _callback:callback};
        return this._startAnimation("scroll", info, duration, acceleration);
    },

    fireAnimationScroll : function (ratio, ID, earlyFinish) {
        var info = this.$scrollAnimationInfo,
            fromLeft = info._fromLeft, toLeft = info._toLeft,
            fromTop = info._fromTop, toTop = info._toTop,
            newLeft = this._getRatioTargetValue(fromLeft, toLeft, ratio),
            newTop = this._getRatioTargetValue(fromTop, toTop, ratio);

        if (ratio == 1) {
            this._clearAnimationInfo("scroll");
        }
        this.scrollTo(newLeft, newTop, null, (ratio < 1));
        if (ratio ==1 && info._callback) {
            this._fireAnimationCompletionCallback(info._callback, earlyFinish);
        }
    },


    // animate show effect / effectID split into separate objects for clarity / integration with
    // tools etc
    // (We could also separate animate hide effects from animate show effects).
    //> @type animateShowEffectId
    // String specifying effect to apply during an animated show or hide.
    // @value "slide" content slides into or out of view as the widget grows or shrinks
    // @value "wipe" content is revealed or wiped as the widget grows or shrinks
    // @value "fade" widget's opacity smoothly fades into or out of view
    // @value "fly" widget moves into position from offscreen
    // @visibility animation
    //<

    //> @object animateShowEffect
    // Configuration object for effect to apply during an animated show or hide.
    // @treeLocation Client Reference/System
    // @visibility animation
    //<
    //> @attr animateShowEffect.effect (animateShowEffectId : null : IR)
    // Effect to apply
    // @visibility animation
    //<

    //> @attr animateShowEffect.startFrom (string : null : IR)
    //   For show animations of type <code>"wipe"</code> and
    //   <code>"slide"</code> this attribute specifies where the wipe / slide should originate.
    //   Valid values are <code>"T"</code> (vertical animation from the top down, the
    //   default behavior), and <code>"L"</code> (horizontal animation from the left side).
    // @visibility animation
    //<

    //> @attr animateShowEffect.endsAt (string : null : IR)
    //   For hide animations of type <code>"wipe</code> and
    //   <code>"slide"</code> this attribute specifies where the wipe / slide should finish.
    //   Valid options are <code>"T"</code> (vertical animation upwards to the top of the canvas,
    //   the default behavior) and <code>"L"</code> (horizontal animation to the left of the
    //   canvas).
    // @visibility animation
    //<

    //> @method canvas.animateShow()
    // Show a canvas by growing it vertically to its fully drawn height over a period of time.
    // This method will not fire if the widget is already drawn and visible, or has overflow
    // other than <code>"visible"</code> or <code>"hidden"</code>.
    // @param [effect] (animateShowEffectId | animateShowEffect) Animation effect to use
    //      when revealing the widget. If ommitted, default behavior can be configured via
    //      +link{Canvas.animateShowEffect}
    // @param [callback] (AnimationCallback) When the show completes this callback will be fired. Single
    //                              'earlyFinish' parameter will be passed if the animation was
    //                              cut short by a call to finishAnimation.
    // @param [duration] (Integer) Duration in ms of the animated show. If unset, duration will be
    //   picked up from +link{canvas.animateShowTime}
    // @param [acceleration] (AnimationAcceleration) Optional acceleration effect function to
    //   bias the animation ratios.  If unset, acceleration will be picked up from
    //   +link{canvas.animateShowAcceleration}
    // @visibility animation
    // @group animation
    // @example animateWipe
    //<
    _$show:"show",
    _$slide:"slide",
    _$wipe:"wipe",
    _$fade:"fade",
    _$fly:"fly",
    _$T:"T", _$L:"L",
    _showEffectAnimationMap:{slide:"show", wipe:"show", fly:"move", fade:"fade"},
    animateShow : function (effect, callback, duration, acceleration) {
        // have a way to default the animate show / hide effect for all calls to these methods
        if (effect == null) effect = this.animateShowEffect;

        var effectConfig;
        if (isc.isAn.Object(effect)) {
            effectConfig = effect;
            effect = effect.effect;
        }
        // If we're in the process of doing an animateHide(), finish that before we do the
        // animateShow() - this is required to avoid a no-op due to the fact that the widget
        // is currently drawn/visible.
        if (this._animatingHide != null) this.finishAnimation(this._animatingHide);

        // Could fire callback if it's already showing?
        if (this.isDrawn() && this.isVisible()) {
            return;
        }
        // Also - if we're in mid 'animateShow()' just bail

        if (this._animatingShow != null) {
            return;
        }

        // If we're undrawn, draw() if _drawOnShow() is true - true for top level widgets
        // that are not peers.
        // Otherwise fall through to default 'show()' method to show [without drawing]
        // immediately
        if (!this.isDrawn()) {
            if (this.parentElement && !this.parentElement.isDrawn()) {
                this.show();
                this.logInfo("not animating show, component not drawn", "animation");
                // again - this is an 'early finish'
                this.animateShowComplete(true);
                return;
            } else {
                this.draw();
            }
        }

        // animateShow() / animateHide() fall through to various methods to perform the actual
        // animation based on the effect passed in.
        // This means we can't just check 'this.isAnimating("show")' or 'this.isAnimating("hide")'
        // - the animation may be performed via a move or fade.
        // Add a flag at the beginning of animateShow() / animateHide() so we can readily check
        // for the case where we're in this state.
        // Also - always fire an "animateShowComplete()" callback when the show/hide completes
        // this allows us to clear the flag before firing whatever callback was passed into
        // this method.
        this._animatingShow = this._showEffectAnimationMap[effect] || this._$show;
        this._animateShowCallback = callback;

        if (!this._animateShowCompleteCallback)
            this._animateShowCompleteCallback = {target:this, methodName:"animateShowComplete"}

        if (effect == this._$fade) {
            var targetOpacity = this.opacity;
            this._fadeShowCallback = callback;
            this.setOpacity(0);
            this.show();
            // Explicitly default to animateShowTime / animateShowAcceleration rather than
            // falling through to animateFadeTime / Acceleration
            if (duration == null) duration = this.animateShowTime;
            if (acceleration == null) acceleration = this.animateShowAcceleration;
            // Simply fall through to animate fade, then fire the callback on completion.
            return this.animateFade(targetOpacity, this._animateShowCompleteCallback,
                                    duration, acceleration);
        } else if (effect == this._$fly) {
            // fly effect not currently supported for non-top-level widgets

            if (this.parentElement != null) {
                this.logInfo("animateShow() called with 'fly' effect - not supported for child widgets" +
                             " defaulting to standard 'wipe' animation instead.", "animation");
                effect = this._$wipe;
            } else {

                // Explicitly default to animateShowTime / animateShowAcceleration rather than
                // falling through to animateMoveTime / Acceleration
                if (duration == null) duration = this.animateShowTime;
                if (acceleration == null) acceleration = this.animateShowAcceleration;
                // Simply fall through to animate move, then fire the callback on completion.

                var rtl = this.isRTL(),
                    specifiedLeft = this.getLeft(),
                    offscreenLeft = rtl ? isc.Page.getWidth() + isc.Page.getScrollLeft()
                                        : 0 - this.getVisibleWidth();

                this._flyShowPercentLeft = this._percent_left,

                this.setLeft(offscreenLeft);
                this.show();
                return this.animateMove(specifiedLeft, null, this._animateShowCompleteCallback,
                                        duration, acceleration);
            }
        }
        // If we can't animate the show, just show and fire callback
        if (!this._canAnimateClip(effect)) {
            this.logInfo("not animating show, can't do clip animations", "animation");
            this.show();
            // essentially this is an 'early finish'
            this.animateShowComplete(true);
            return;
        }

        // Start from drawn / hidden - this way we can get the drawn scrollHeight.
        if (this.isVisible()) this.hide();

        var drawnHeight = this.getVisibleHeight(),
            drawnWidth = this.getVisibleWidth(),
            // default to showing from the top down
            // Note that we currently just support top down or left in so convert this to a
            // boolean for simplicity

            vertical = effectConfig ? effectConfig.startFrom == this._$T : true,
            scrollStart = (vertical ? this.getScrollTop() : this.getScrollLeft()),
            slideIn = (effect == "slide"),

            info = {
                _userHeight:this._userHeight, _specifiedHeight:this.getHeight(),
                _drawnHeight:drawnHeight,
                _userWidth:this._userWidth, _specifiedWidth:this.getWidth(),
                _drawnWidth:drawnWidth,

                _percentWidth:this._percent_width, _percentHeight:this._percent_height,

                _originalOverflow:this.overflow,

                _vertical:vertical,
                _scrollStart:scrollStart,
                _slideIn:slideIn,

                _callback:this._animateShowCompleteCallback
            };

        if (vertical) {
            if (this.vscrollOn && this.vscrollbar) {
                info._scrollThumbStart = this.vscrollbar.thumb.getTop();
                info._scrollThumbLength = this.vscrollbar.thumb.getHeight();

                // don't show the thumb with the s-b - we'll show it and grow it into view
                if (this.vscrollbar.thumb) {
                    this.vscrollbar.thumb._showWithMaster = false;
                    this.vscrollbar.thumb._suppressImageResize = true;
                }

                this.vscrollbar._suppressSetThumb = true;
                this.vscrollbar._suppressImageResize = true;

                // resize the scrollbar to be 1px so it doesn't flash when first shown
                this.vscrollbar.setHeight(1);
            }
            if (this.hscrollOn && this.hscrollbar) {
                this.hscrollbar._suppressImageResize = true;
                if (this.hscrollbar.thumb) this.hscrollbar.thumb._suppressImageResize = true;
                // If we're doing a wipe, we won't show the breadth scrollbar until
                // the rest of the widget has been 'wiped' into view
                if (!info._slideIn) {
                    this.hscrollbar._showWithMaster = false;
                } else {
                    this.hscrollbar.setTop(this.getTop());
                    this.hscrollbar.setHeight(1);
                }
            }

        } else {
            if (this.hscrollOn && this.hscrollbar) {
                info._scrollThumbStart = this.hscrollbar.thumb.getLeft();
                info._scrollThumbLength = this.hscrollbar.thumb.getWidth();

                this.hscrollbar._suppressSetThumb = true;
                this.hscrollbar._suppressImageResize = true;


                // don't show the thumb with the s-b - we'll show it and grow it into view
                if (this.hscrollbar.thumb) {
                    this.hscrollbar.thumb._showWithMaster = false;
                    this.hscrollbar.thumb._suppressImageResize = true;
                }
                this.hscrollbar.setWidth(1);
            }
            if (this.vscrollOn && this.vscrollbar) {
                this.vscrollbar._suppressImageResize = true;
                if (this.vscrollbar.thumb) this.vscrollbar.thumb._suppressImageResize = true;
                // If we're doing a wipe, we won't show the breadth scrollbar until
                // the rest of the widget has been 'wiped' into view
                if (!info._slideIn) {
                    this.vscrollbar._showWithMaster = false;
                } else {
                    this.vscrollbar.setLeft(this.getLeft());
                    this.vscrollbar.setWidth(1);
                }
            }
        }

        // If we have a visible edged canvas suppress react to resize before we set overflow
        // to hidden or resize the handle so the edged canvas doesn't get resized as a peer

        if (this.showEdges && this._edgedCanvas) {
            this._edgedCanvas._suppressReactToResize = true;
        }

        // Set overflow to hidden, then grow to the drawn size (and then reset overflow)
        if (this.overflow == isc.Canvas.VISIBLE) {
            this.setOverflow(isc.Canvas.HIDDEN);
        }

        // suppress adjustOverflow during the animation if we have scrollbars
        if (this.overflow == isc.Canvas.AUTO || this.overflow == isc.Canvas.SCROLL) {
            this._suppressAdjustOverflow = true;
        }

        // additional param indicates that this is an animated resize
        this.resizeTo((vertical ? drawnWidth : 1), (vertical ? 1 : drawnHeight), true);
        if (slideIn) this.scrollTo((vertical ? null : scrollStart + (drawnWidth-1)),
                                   (vertical ? scrollStart + (drawnHeight-1) : null));


        if (this.showEdges && this._edgedCanvas) {
            // Explicitly size the edgeCanvas' table (rather than sizing at 100%), so that
            // as the edged canvas resizes, the edge clips rather than growing/shrinking
            if (vertical)
                this._assignSize(this._edgedCanvas.getHandle().firstChild.style, "height", drawnHeight);
            else
                this._assignSize(this._edgedCanvas.getHandle().firstChild.style, "width", drawnWidth);

            this._edgedCanvas.setOverflow(isc.Canvas.HIDDEN);

            // If we're sliding in, align the handle with the top of the edged canvas to
            // start with, so it will grow down from the top.
            if (slideIn) {
                if (vertical) {
                    var startEdgeSize = this._edgedCanvas._topMargin;
                    this._assignSize(this.getStyleHandle(), "marginTop", (this.getTopMargin() - startEdgeSize));
                } else {
                    var startEdgeSize = this._edgedCanvas._leftMargin;
                    this._assignSize(this.getStyleHandle(), "marginLeft", (this.getLeftMargin() - startEdgeSize));
                }
            }

            // Don't show the main Canvas right away if we have edges, just show the edges.
            // Only show the edges, then show the main Canvas when the animation has passed the
            // edge.
            this._edgedCanvas.show();
        } else {
            var breadthScrollbar = vertical ? (this.hscrollOn ? this.hscrollbar : null)
                                            : (this.vscrollOn ? this.vscrollbar : null),

                lengthScrollbar = vertical ? (this.vscrollOn ? this.vscrollbar : null)
                                           : (this.hscrollOn ? this.hscrollbar : null);

            // If we're sliding in, and we have an h-scrollbar, show it and allow it to grow
            // before showing this canvas
            if (breadthScrollbar && info._slideIn) {
                breadthScrollbar.show();
                if (lengthScrollbar) lengthScrollbar.show();
            } else {
                this.show();
            }
        }

        return this._startAnimation(this._$show, info, duration, acceleration);

    },

    // Actually fire the show animation
    // Grows the widget (according to the current ratio), and if slideIn is true keeps scrolled
    // so the content appears to slide in with the bottom of the widget.
    fireAnimationShow : function (ratio, ID, earlyFinish) {
        var info = this.$showAnimationInfo,
            vertical = info._vertical;


        if (ratio < 1) {
            var drawnSize = (vertical ? info._drawnHeight : info._drawnWidth),
                size = this._getRatioTargetValue(1, drawnSize, ratio),
                delta = drawnSize - size,
                adjustForEdge = (this.showEdges && this._edgedCanvas),
                // Note if we're wiping into view we show the top edge, then the bottom edge
                // if we're sliding into view it's the other way around because of scrolling
                startEdgeSize, endEdgeSize;


            if (adjustForEdge) {
                // Note: we can't just check this.edgeSize, since we support asymmetric edges
                // and by default the value is just picked up from the EdgedCanvas class.
                startEdgeSize = (info._slideIn ? (vertical ? this._edgedCanvas._bottomMargin
                                                           : this._edgedCanvas._rightMargin)
                                               : (vertical ? this._edgedCanvas._topMargin
                                                           : this._edgedCanvas._leftMargin)),
                endEdgeSize = (info._slideIn ? (vertical ? this._edgedCanvas._topMargin
                                                         : this._edgedCanvas._leftMargin)
                                             : (vertical ? this._edgedCanvas._bottomMargin
                                                         : this._edgedCanvas._rightMargin));

                this._edgedCanvas.resizeTo((vertical ? null : size), (vertical ? size: null), true);
                if (info._slideIn) {
                    if (vertical) this._edgedCanvas.scrollToBottom();
                    else this._edgedCanvas.scrollToRight();
                }

                // Just bail if we haven't started to expose the actual handle yet.
                if (size < startEdgeSize) return;

                // We don't need to resize the handle once it's completely exposed (at this
                // point we're just revealing the final edge)
                if (delta <= endEdgeSize) {
                    // If sliding in, align the top of the handle with the bottom of the
                    // top edge, and ensure we're now scrolled to our final scroll position
                    // (avoids a jump when we actually reach ratio 1).
                    if (info._slideIn) {
                        var marginProp = (vertical ? "marginTop" : "marginLeft"),
                            marginSize = (vertical ? this.getTopMargin() - delta
                                                   : this.getLeftMargin() - delta);
                        this._assignSize(this.getStyleHandle(), marginProp, marginSize);

                        this.scrollTo((vertical ? null : info._scrollStart),
                                      (vertical ? info._scrollTop : null),
                                      null, true);
                    }
                    return;
                }

                // If we got here, we know the handle should be >= 1px tall, so needs to be
                // visible

                if (!this.isVisible()) {
                    this._showingAsAnimation = true;
                    this.show();
                    delete this._showingAsAnimation;
                }
            }


            var lengthScrollOn = vertical ? this.vscrollOn : this.hscrollOn,
                breadthScrollOn = vertical ? this.hscrollOn : this.vscrollOn;
            if (lengthScrollOn) {
                var lengthScrollbar;
                if (vertical) {
                    lengthScrollbar = this.vscrollbar;
                    if (lengthScrollbar) lengthScrollbar.resizeTo(null, size);
                } else {
                    lengthScrollbar = this.hscrollbar;
                    var sbsize = size;
                    if (this.vscrollOn) {
                        if (info._slideIn) {
                            sbsize -= this.scrollbarSize;
                        } else {
                            sbsize = Math.min(size, drawnSize-this.scrollbarSize);
                        }
                    }
                    if (sbsize > 0) {
                        if (lengthScrollbar) lengthScrollbar.resizeTo(sbsize, null);
                    }
                }

                if (info._slideIn && lengthScrollbar) {
                    if (vertical) lengthScrollbar.scrollToBottom();
                    else lengthScrollbar.scrollToRight();
                }

                // thumb
                if (lengthScrollbar && lengthScrollbar.thumb) {
                    var thumb = lengthScrollbar.thumb;

                    // On a "slideIn" we need to grow the thumb then shift it in from the top
                    if (info._slideIn) {
                        var thumbStart = info._scrollThumbStart - delta,
                            thumbEnd = thumbStart + Math.min(size, info._scrollThumbLength),
                            start = vertical ? this.getTop() : this.getLeft();

                        if (thumbEnd <= start) {
                            // thumb should already be hidden - don't show it
                        } else {
                            // shorten the thumb if necessary
                            thumbStart = Math.max(start, thumbStart);
                            var thumbLength = Math.min(thumbEnd-thumbStart, size);

                            thumb.resizeTo(vertical ? null : thumbLength,
                                           vertical ? thumbLength : null);

                            if (vertical) thumb.scrollToBottom()
                            else thumb.scrollToRight();

                            thumb.moveTo(vertical ? null : thumbStart,
                                         vertical ? thumbStart: null);
                            if (!thumb.isVisible()) thumb.show();
                        }

                    // on a wipe animation, we simply show, then resize the thumb from the
                    // top down
                    } else {
                        var thumbStart = info._scrollThumbStart,
                            thumbEnd = Math.min((thumbStart + info._scrollThumbLength),
                                                (vertical ?
                                                    this.getTop() + size :
                                                    this.getLeft() + size));

                        var end = (vertical ? this.getTop() : this.getLeft()) + size
                        if (end <= thumbStart) {
                            // don't show the thumb yet unless its in view
                        } else {
                            if (vertical) thumb.setHeight(thumbEnd -thumbStart);
                            else thumb.setWidth(thumbEnd-thumbStart);
                            if (!thumb.isVisible()) thumb.show();
                        }
                    }
                }
            }

            // If we're showing a breadth scrollbar, the widget handle renders at the the
            // specified size less the scrollbarsize
            // If the scrollbar is (partially or fully) hidden we therefore need to increase our
            // specified size by the difference between the rendered scrollbarSize and
            // this.scrollbarSize to ensure the handle draws large enough
            var hiddenScrollbarDelta = 0;
            if (breadthScrollOn && breadthScrollbar) {
                var breadthScrollbar = vertical ? this.hscrollbar : this.vscrollbar;
                if (info._slideIn) {

                    var sbStart = vertical ? (this.getTop() + Math.max(0, (size - this.scrollbarSize)))
                                           : (this.getLeft() + Math.max(0, (size - this.scrollbarSize)))
                    breadthScrollbar.moveTo(vertical ? null : sbStart, vertical ? sbStart : null);

                    var sbSize = Math.min(size, this.scrollbarSize);
                    breadthScrollbar.resizeTo(vertical ? null : sbSize,
                                              vertical ? sbSize : null);

                    if (vertical) {
                        breadthScrollbar.scrollToBottom();
                        if (breadthScrollbar.thumb) breadthScrollbar.thumb.scrollToBottom();
                    } else {
                        breadthScrollbar.scrollToRight();
                        if (breadthScrollbar.thumb) breadthScrollbar.thumb.scrollToRight();
                    }


                    if (size > this.scrollbarSize && !this.isVisible()) {

                        this._showingAsAnimation = true;
                        this.show();
                        delete this._showingAsAnimation;
                    }
                } else {
                    if (delta <= this.scrollbarSize) {
                        if (!breadthScrollbar.isVisible()) breadthScrollbar.show();
                        breadthScrollbar.resizeTo(vertical ? null : this.scrollbarSize-delta,
                                                  vertical ? this.scrollbarSize-delta : null);
                    }
                    // Otherwise we know the scrollbar isn't showing - nothing to do here
                }

                if (breadthScrollbar.isVisible()) {
                    hiddenScrollbarDelta = this.scrollbarSize -
                                            (vertical ? breadthScrollbar.getHeight()
                                                      : breadthScrollbar.getWidth());
                } else {
                    hiddenScrollbarDelta = this.scrollbarSize;
                }
            }

            // Actually resize the handle.
            // If we're showing edges, modify the height passed to resizeTo so we don't account
            // for the bottom edge which is currently clipped.
            var handleSize = size;
            if (adjustForEdge) handleSize += endEdgeSize;
            // ditto with the "breadth" axis scrollbar
            if (hiddenScrollbarDelta) handleSize += hiddenScrollbarDelta


            // Note additional param
            // - to avoid firing layoutChildren() on every step.
            // - notify that this is not an external 'resize' call

            if (!this.resizeTo((vertical ? null : handleSize), (vertical ? handleSize : null),
                                true))
            {
                this._resized();
            }
            if (info._slideIn) {
                this.scrollTo((vertical ? null : info._scrollStart + delta),
                              (vertical ? info._scrollStart + delta : null),
                              null, true);
            }

        // Ratio == 1
        } else {
            // If we are showing edges we're not show()n until we get pushed / scrolled into
            // view.
            // If we're not visible now, call this.show()
            // (Only likely to happen from an early finish of the animation)
            if (!this.isVisible()) this.show();

            this._clearAnimationInfo("show");

            if (!this.resizeTo(info._specifiedWidth, info._specifiedHeight)) {
                // force _resized() notification to fire - this is required since if we're resizing
                // a breadth scrollbar our reported size may not have changed but our drawn size
                // may  have. We still want layouts etc to respond to the size change.
                this._resized();
            }

            this.setOverflow(info._originalOverflow);

            if (this.overflow == isc.Canvas.AUTO || this.overflow == isc.Canvas.SCROLL) {
                delete this._suppressAdjustOverflow;

                // reset all the properties for auto-management of scrollbar.
                if (this.vscrollOn && this.vscrollbar) {
                    if (this.vscrollbar.visibility == isc.Canvas.HIDDEN) this.vscrollbar.show();
                    if (vertical) delete this.vscrollbar._suppressSetThumb;
                    delete this.vscrollbar._suppressImageResize;
                    this.vscrollbar._showWithMaster = true;
                    if (info._slideIn) this.vscrollbar.scrollTo(0,0);
                    if (this.vscrollbar.thumb) {
                        delete this.vscrollbar.thumb._suppressImageResize;
                        this.vscrollbar.thumb._showWithMaster = true;
                        if (info._sideIn) this.vscrollbar.thumb.scrollTo(0,0);
                    }
                    if (!vertical) {
                        this.vscrollbar.setWidth(this.getScrollbarSize());
                        this.vscrollbar.setThumb();
                    }
                }
                if (this.hscrollOn && this.hscrollbar) {
                    if (this.hscrollbar.visibility == isc.Canvas.HIDDEN) this.hscrollbar.show();
                    if (!vertical) {
                        delete this.hscrollbar._suppressSetThumb;
                    } else {
                        this.hscrollbar.setHeight(this.getScrollbarSize());
                        this.hscrollbar.setThumb();
                    }
                    delete this.hscrollbar._suppressImageResize;
                    this.hscrollbar._showWithMaster = true;
                    if (info._slideIn) this.hscrollbar.scrollTo(0,0);
                    if (this.hscrollbar.thumb) {
                        delete this.hscrollbar.thumb._suppressImageResize;
                        this.hscrollbar.thumb._showWithMaster = true;
                        if (info._slideIn) this.hscrollbar.thumb.scrollTo(0,0);
                    }
                }
            }

            if (this.showEdges && this._edgedCanvas) {
                if (info._slideIn) {
                    var marginProp = (vertical ? "marginTop" : "marginLeft"),
                        marginSize = (vertical ? this.getTopMargin() : this.getLeftMargin());
                    this._assignSize(this.getStyleHandle(), marginProp, marginSize);
                    this._edgedCanvas.scrollTo((vertical ? null : 0), (vertical ? 0 : null));
                }
                if (vertical)
                    this._edgedCanvas.getHandle().firstChild.style.height = "100%";
                else
                    this._edgedCanvas.getHandle().firstChild.style.width = "100%";

                this._edgedCanvas.setOverflow(isc.Canvas.VISIBLE);
                delete this._edgedCanvas._suppressReactToResize;
            }



            this._userWidth = info._userWidth;
            this._userHeight = info._userHeight;

            this._percent_width = info._percentWidth;
            this._percent_height = info._percentHeight;

            if (info._slideIn) this.scrollTo((vertical ? null : info._scrollStart),
                                             (vertical ? info._scrollStart : null));
            if (info._callback) {
                this._fireAnimationCompletionCallback(info._callback, earlyFinish);
            }
        }
    },

    // Always fired when show animation completes
    animateShowComplete : function (earlyFinish) {

        if (this._flyShowPercentLeft != null) {
            this._percent_left = this._flyShowPercentLeft;
            delete this._flyShowPercentLeft;
        }

        this._animatingShow = null;
        var callback = this._animateShowCallback;
        this._animateShowCallback = null;
        // Pass in the 'synchronous' param to fireAnimationComplete so the callback fires
        // synchronously. animateShowComplete() was itself fired asynchronously so no need
        // to delay again.
        if (callback) this._fireAnimationCompletionCallback(callback, earlyFinish, true);
    },

    //> @attr canvas.canAnimateClip (boolean : null : IRWA)
    // Whether to "wipe" and "slide" show/hide animations.  Default is to allow such animations
    // for non-scrolling widgets.
    // @group animation
    // @visibility internal
    //<

    _canAnimateClip : function (effect) {
        if (this.canAnimateClip != null) return this.canAnimateClip;
        // - slide effect calls scrollTo() code - should not do so if scrollTo method has been
        //   overridden, as component may not understand animation, so check:
        //         this.scrollTo == isc.Canvas.getInstanceProperty("scrollTo")
        return (this.scrollTo == isc.Canvas.getInstanceProperty("scrollTo"));

    },

    //> @method canvas.animateHide()
    // Hide a canvas by shrinking it vertically to zero height over a period of time.
    // This method will not fire if the widget is already drawn and visible, or has overflow
    // other than <code>"visible"</code> or <code>"hidden"</code>.
    // @param [effect] (animateShowEffectId | animateShowEffect) How should the content of the
    //  window be hidden during the hide? If ommitted, default behavior can be configured via
    //  +link{Canvas.animateHideEffect}
    // @param [callback] (AnimationCallback) When the hide completes this callback will be fired. Single
    //                              'earlyFinish' parameter will be passed if the animation was
    //                              cut short by a call to finishAnimation.
    // @param [duration] (Integer) Duration in ms of the animated hide.  If unset, duration will be
    //   picked up from +link{canvas.animateHideTime}
    // @param [acceleration] (AnimationAcceleration) Optional acceleration effect function to bias
    //   the animation ratios.  If unset, acceleration will be picked up from
    //   +link{canvas.animateShowTime}
    // @visibility animation
    // @group animation
    // @example animateWipe
    //<
    // @param [synchronousCallback] By default we fire the callback passed into this method
    //                      asynchronously, after the method completes, which allows the
    //                      screen to update before potentially complex callback logic fires
    //                      in some very advanced uses we may require the callback to fire
    //                      synchronously in response to the last step of animation - this
    //                      is achieved via this parameter (used in Layout.js)
    _$hide:"hide",
    _hideEffectAnimationMap:{slide:"hide", wipe:"hide", fly:"move", fade:"fade"},
    animateHide : function (effect, callback, duration, acceleration, synchronousCallback) {
        // have a way to default the animate show / hide effect for all calls to these methods
        if (effect == null) effect = this.animateHideEffect;

        var effectConfig;
        if (isc.isAn.Object(effect)) {
            effectConfig = effect;
            effect = effectConfig.effect;
        }
        // Complate any 'show' animation before starting to hide
        if (this._animatingShow != null) {
            this.finishAnimation(this._animatingShow);
        }
        // If we're already hidden, or undrawn, just bail

        if (!this.isVisible()) return;
        // don't allow 2 calls to animateHide to overlap
        if (this._animatingHide != null) return;
        // If we're undrawn, don't bother doing an animated hide, just hide and fire the
        // callback.

        if (!this.isDrawn() && !isc.isA.LayoutSpacer(this)) {
            this.hide();
            if (callback) this._fireAnimationCompletionCallback(callback, true);
            return;
        }


        this._animatingHide = this._hideEffectAnimationMap[effect] || this._$hide;
        this._animateHideCallback = callback;
        if (!this._animateHideCompleteCallback)
            this._animateHideCompleteCallback = {target:this, methodName:"_animateHideComplete"}

        if (effect == this._$fade) {
            this._fadeHideOpacity = this.opacity;

            this._performingFadeHide = true;

            // default to hide time rather than 'fade' time if no time was passed in
            if (duration == null) duration = this.animateHideTime;
            if (acceleration == null) acceleration = this.animateHideAcceleration;
            // Simply fall through to animate fade, then fire the callback on completion.
            return this.animateFade(0, this._animateHideCompleteCallback,
                                     duration, acceleration, synchronousCallback);
        } else if (effect == this._$fly) {
            this._flyHideLeft = this.getLeft();
            this._flyHidePercentLeft = this._percent_left;

            if (this.parentElement != null) {
                this.logInfo("animateHide() called with 'fly' effect - not supported for child widgets" +
                             " defaulting to standard 'wipe' animation instead.", "animation");
                effect = this._$wipe;
            } else {

                // Explicitly default to animateShowTime / animateShowAcceleration rather than
                // falling through to animateMoveTime / Acceleration
                if (duration == null) duration = this.animateShowTime;
                if (acceleration == null) acceleration = this.animateShowAcceleration;
                // Simply fall through to animate fade, then fire the callback on completion.

                var rtl = this.isRTL(),
                    offscreenLeft = rtl ? isc.Page.getWidth() + isc.Page.getScrollLeft()
                                        : 0 - this.getVisibleWidth();

                return this.animateMove(offscreenLeft, null,
                                        this._animateHideCompleteCallback,
                                        duration, acceleration, synchronousCallback);
            }
        }
        // at this point we're doing a standard hide type animation with wipe / slide effect
        // HACK: LayoutSpacer never reports itself drawn, but can animate
        if ((!this._canAnimateClip(effect) || !this.isDrawn()) &&
            !this.isA(isc.LayoutSpacer))
        {
            this.logInfo("not animating hide, can't do clip animations", "animation");
            this.hide();
            // pass the early-finish parameter
            this._animateHideComplete(true);
            return;
        }

        var drawnHeight = this.getVisibleHeight(),
            drawnWidth = this.getVisibleWidth(),
            vertical = (effectConfig ? effectConfig.endAt == this._$T : true),

            info = {_userHeight:this._userHeight, _specifiedHeight:this.getHeight(),
                    _drawnHeight:drawnHeight,
                    _userWidth:this._userWidth, _specifiedWidth:this.getWidth(),
                    _drawnWidth:drawnWidth,
                    _scrollStart:(vertical ? this.getScrollTop() : this.getScrollLeft()),
                    _vertical:vertical,
                    _slideOut:effect == "slide",
                    _originalOverflow:this.overflow,
                    _callback:this._animateHideCompleteCallback,
                    _synchronousCallback:synchronousCallback
            };

        if (info._slideOut) {
            // remember the length-scrollbar thumb position at the beginning of the animation
            // and size
            if (vertical && this.vscrollOn && this.vscrollbar) {
                info._scrollThumbStart = this.vscrollbar.thumb.getTop();
                info._scrollThumbLength = this.vscrollbar.thumb.getHeight();
            } else if (!vertical && this.hscrollOn && this.hscrollbar) {
                info._scrollThumbStart = this.hscrollbar.thumb.getLeft();
                info._scrollThumbLength = this.hscrollbar.thumb.getWidth();
            }
        }

        // If overflow is visible, set to hidden so the content will clip as we shrink

        this.resizeTo(drawnWidth, drawnHeight, true);

        if (this.overflow == isc.Canvas.VISIBLE) this.setOverflow(isc.Canvas.HIDDEN);
        // suppress adjustOverflow during the animation if we have scrollbars
        if (this.overflow == isc.Canvas.AUTO || this.overflow == isc.Canvas.SCROLL) {
            this._suppressAdjustOverflow = true;

            if (this.vscrollOn && this.vscrollbar) {
                // allow the master to be hidden without hiding either scrollbar
                this.vscrollbar._showWithMaster = false;
                // avoid setThumb if this is the length scrollbar
                if (vertical) this.vscrollbar._suppressSetThumb = true;
                // avoid image resize so we can clip properly
                this.vscrollbar._suppressImageResize = true;

                if (this.vscrollbar.thumb) {
                    this.vscrollbar.thumb._suppressImageResize = true;
                }
            }
            if (this.hscrollOn && this.hscrollbar) {
                // allow the master to be hidden without hiding either scrollbar
                this.hscrollbar._showWithMaster = false;
                // avoid setThumb if this is the length scrollbar
                if (!vertical) this.hscrollbar._suppressSetThumb = true;
                // avoid image resize so we can clip properly
                this.hscrollbar._suppressImageResize = true;

                if (this.hscrollbar.thumb) {
                    this.hscrollbar.thumb._suppressImageResize = true;
                }
            }
        }

        if (this.showEdges) {
            this._edgedCanvas.setOverflow("hidden");
            this._edgedCanvas._suppressReactToResize = true;
            this._assignSize(this._edgedCanvas.getHandle().firstChild.style,
                             (vertical ? "height" : "width"),
                             (vertical ? this._edgedCanvas.getHeight() : this._edgedCanvas.getWidth()));
        }
        return this._startAnimation(this._$hide, info, duration, acceleration);
    },

    // fireAnimationHide() - called repeatedly during an animated show() / hide() if the
    // animate effect is "slide" or "wipe" rather than "fade".
    fireAnimationHide : function (ratio, ID, earlyFinish) {
        var info = this.$hideAnimationInfo,
            vertical = info._vertical;


        if (ratio < 1) {

            var drawnSize = (vertical ? info._drawnHeight : info._drawnWidth),
                size = this._getRatioTargetValue(drawnSize, 1, ratio),
                delta = drawnSize - size,
                adjustForEdge = (this.showEdges && this._edgedCanvas),
                // Note that if we're sliding in we hide the top edge first, whereas if
                // we're wiping, we hide the bottom edge first
                startEdgeSize, endEdgeSize,

                // if we're showing scrollbars, (for a vertical wipe/slide)
                // - HScrollbar will get clipped, then hidden as the hide proceeds
                // - VScrollbar will get clipped/resized as the hide proceeds
                // Both need to be reset on completion (can probably just use adjustOverflow?)
                hasHScrollbar = this.hscrollOn && this.hscrollbar,
                hasVScrollbar = this.vscrollOn && this.vscrollbar;

            // custom logic for showing edged canvii
            if (adjustForEdge) {

                startEdgeSize = (info._slideOut ? (vertical ? this._edgedCanvas._topMargin
                                                            : this._edgedCanvas._leftMargin)
                                               : (vertical ? this._edgedCanvas._bottomMargin
                                                           : this._edgedCanvas._rightMargin));
                endEdgeSize = (info._slideOut ? (vertical ? this._edgedCanvas._bottomMargin
                                                          : this._edigedCanvas._rightMargin)
                                               : (vertical ? this._edgedCanvas._topMargin
                                                           : this._edgedCanvas._leftMargin));

                this._edgedCanvas.resizeTo((vertical ? null : size), (vertical ? size : null), true);
                if (info._slideOut) {
                    if (vertical) this._edgedCanvas.scrollToBottom();
                    else this._edgedCanvas.scrollToRight();
                }

                // For the first few px of the animation were either clipping the bottom edge,
                // or sliding the top edge out of sight, and leaving the handle visible.
                if (delta < startEdgeSize) {
                    // slide case: shrink the top margin of the handle to shift it up with the
                    // top edge
                    if (info._slideOut) {
                        var marginProp = (vertical ? "marginTop" : "marginLeft"),
                            marginSize = (vertical ? this.getTopMargin() : this.getLeftMargin())
                        this._assignSize(this.getStyleHandle(), marginProp, (marginSize- delta));
                    }
                    // Bail - we don't want to resize the handle at all.
                    // fire resized notification anyway - allows layouts to respond to the new size
                    this._resized();
                    return;
                }

                // If we're sliding out of view, ensure the top of the handle is exactly level
                // with the top of the edged canvas.
                if (info._slideOut && !this._adjustedForEdge) {
                    var marginProp = (vertical ? "marginTop" : "marginLeft"),
                        marginSize = (vertical ? this.getTopMargin() : this.getLeftMargin())

                    this._assignSize(this.getStyleHandle(), marginProp, (marginSize - startEdgeSize));
                    this._adjustedForEdge = true;
                }

                // actually hide the canvas handle (without firing any handlers) if the total
                // size is less than the height of the edge at this point.
                if (adjustForEdge && size <= endEdgeSize) {
                    // set the flag so we don't trip the 'finishAnimation()' from hide()
                    this._hidingAsAnimation = true;
                    this.getStyleHandle().visibility = isc.Canvas.HIDDEN;
                    delete this._hidingAsAnimation;
                }
            }

            // resize the vertical scrollbar with us as we shrink
            var lengthScrollbar = vertical ? (hasVScrollbar ? this.vscrollbar : null)
                                           : (hasHScrollbar ? this.hscrollbar : null);
            if (lengthScrollbar) {
                if (vertical) lengthScrollbar.setHeight(size);
                else {
                    // If we're showing a v-scrollbar it appears to the right of the hscrollbar
                    // On a wipe, just wait till the vscrollbar is completely hidden before
                    // resizing
                    // On a slide, take the v-scrollbar width into account when resizing
                    var sbsize = size;
                    if (this.vscrollOn) {
                        if (info._slideOut) {
                            sbsize -= this.scrollbarSize;
                        } else {
                            sbsize = Math.min(size, drawnSize - this.scrollbarSize);
                        }
                    }
                    if (sbsize > 0) lengthScrollbar.setWidth(sbsize);
                    else lengthScrollbar.hide();
                }

                if (info._slideOut) {
                    if (vertical) lengthScrollbar.scrollToBottom();
                    else lengthScrollbar.scrollToRight();
                }

                if (lengthScrollbar.thumb && lengthScrollbar.thumb.isVisible()) {

                    // On a "slideOut" we need to move the thumb then shrink it off the top
                    if (info._slideOut) {
                        var thumbStart = info._scrollThumbStart - delta,
                            start = vertical ? this.getTop() : this.getLeft();
                        if (thumbStart >= start) {
                            lengthScrollbar.thumb.moveTo(vertical ? null : thumbStart,
                                                         vertical ? thumbStart : null);
                        } else {
                            lengthScrollbar.thumb.moveTo(vertical ? null : this.getLeft(),
                                                         vertical ? this.getTop() : null);
                            var thumbLength = info._scrollThumbLength + (thumbStart - start);
                            if (thumbLength > 0) {
                                lengthScrollbar.thumb.resizeTo(vertical ? null : thumbLength,
                                                               vertical ? thumbLength : null);
                                lengthScrollbar.thumb.scrollTo(vertical ? null : start - thumbStart,
                                                               vertical ? start - thumbStart : null);
                            } else {
                                lengthScrollbar.thumb.hide();
                            }
                        }
                    // on a wipe animation, we simply resize the thumb so it appears to clip out
                    // of view
                    } else {

                        if (vertical) {
                            var bottom = (this.getTop() + size)
                            if (lengthScrollbar.thumb.getBottom() > bottom) {
                                var thumbHeight = bottom - lengthScrollbar.thumb.getTop();
                                if (thumbHeight > 0) lengthScrollbar.thumb.setHeight(thumbHeight);
                                else lengthScrollbar.thumb.hide();
                            }
                        } else {
                            var right = (this.getLeft() + size)
                            if (lengthScrollbar.thumb.getRight() > right) {
                                var thumbWidth = right - lengthScrollbar.thumb.getLeft();
                                if (thumbWidth> 0) lengthScrollbar.thumb.setWidth(thumbWidth);
                                else lengthScrollbar.thumb.hide();
                            }
                        }
                    }
                }

            }


            // "breadth" scrollbar -- scrollbar which will be clipped across its breadth as
            // it shrinks
            var breadthScrollbar = vertical ? (hasHScrollbar ? this.hscrollbar : null)
                                                 : (hasVScrollbar ? this.vscrollbar : null),
                 // If we're showing a breadth scrollbar, the widget handle renders at the the
                 // specified size less the scrollbarsize
                 // If the scrollbar is (partially or fully) hidden we therefore need to increase
                 // our specified size by the difference between the rendered scrollbarSize and
                 // this.scrollbarSize to ensure the handle draws large enough
                 hiddenScrollbarDelta = 0;

            if (breadthScrollbar) {

                var sbSize = this.scrollbarSize;
                // if we're sliding out, it will hide at the end (just move first)
                // Otherwise it'll hide first
                if (info._slideOut) {
                    if (size >= sbSize) {
                        var offset = (vertical ? this.getTop() : this.getLeft()) + size - sbSize;
                        breadthScrollbar.moveTo(vertical ? null : offset, vertical ? offset: null);
                    } else {
                        breadthScrollbar.moveTo(vertical ? null : this.getLeft(),
                                                vertical ? this.getTop() : null);
                        breadthScrollbar.resizeTo(vertical ? null : size, vertical ? size : null);
                        if (vertical) breadthScrollbar.scrollToBottom();
                        else breadthScrollbar.scrollToRight();
                        var thumb = breadthScrollbar.thumb

                        if (thumb) {
                            thumb.resizeTo(vertical ? null : size, vertical ? size : null);
                            if (vertical) thumb.scrollToBottom();
                            else thumb.scrollToRight();
                        }
                    }

                    // hide the handle (leaving just the breadth sb, and bottom of the length sb
                    // visible) if necessary
                    if (size <= sbSize) {
                        this._hidingAsAnimation = true;
                        if (this.isVisible()) this.hide();
                        delete this._hidingAsAnimation;
                        return;
                    }
                } else {
                    if (delta <= sbSize) {
                        breadthScrollbar.resizeTo(vertical ? null : sbSize-delta,
                                                  vertical ? sbSize-delta : null);
                        if (breadthScrollbar.thumb) {
                            breadthScrollbar.thumb.resizeTo(vertical ? null : sbSize-delta,
                                                            vertical ? sbSize-delta: null);
                        }
                    } else {
                        if (breadthScrollbar.isVisible()) breadthScrollbar.hide();
                    }
                }

                if (breadthScrollbar.isVisible()) {
                    hiddenScrollbarDelta = this.scrollbarSize -
                                            (vertical ? breadthScrollbar.getHeight()
                                                      : breadthScrollbar.getWidth());
                } else {
                    hiddenScrollbarDelta = this.scrollbarSize;
                }
            }

            // resize the handle (actually shrink it)
            // If we're showing an edge, resize add the size of the top (or bottom) edge onto
            // the height so we don't erroneously size leave space for the edge which has
            // already been clipped out of view
            var handleSize = size;
            if (adjustForEdge) handleSize += startEdgeSize;

            if (hiddenScrollbarDelta) handleSize += hiddenScrollbarDelta;

            // resize the handle
            if (!this.resizeTo((vertical ? null : handleSize),
                                (vertical ? handleSize : null), true))
            {
                // if resize() didn't change the specified size, explicitly fire _resized so
                // we react to scrollbar size changes et
                this._resized();
            }

            var scrollAdjustment;
            if (info._slideOut) {
                this.scrollTo((vertical ? null : info._scrollStart + delta),
                              (vertical ? info._scrollStart + delta : null), null, true);
            }

        // Ratio == 1
        } else {
            this._clearAnimationInfo("hide");

            if (this.isVisible()) this.hide();

            if (info._originalOverflow) this.setOverflow(info._originalOverflow);
            if (this.showEdges && this._edgedCanvas) {
                delete this._adjustedForEdge;
                // allow the edged canvas to show up again
                this._edgedCanvas.setOverflow(isc.Canvas.VISIBLE);
                delete this._edgedCanvas._suppressReactToResize;
                if (vertical) this._edgedCanvas.getHandle().firstChild.style.height = "100%";
                else this._edgedCanvas.getHandle().firstChild.style.width  = "100%"
                // reset the margins to float the handle inside the edges.
                if (info._slideOut) {
                    var margins = this._calculateMargins(),
                        marginProp = (vertical ? "marginTop" : "marginLeft"),
                        marginSize = (vertical ? margins.top : margins.left)
                    this._assignSize(this.getStyleHandle(), marginProp, marginSize);
                }
            }
            if (this.overflow == isc.Canvas.AUTO || this.overflow == isc.Canvas.SCROLL) {

                delete this._suppressAdjustOverflow;
                if (vertical) {
                    if (this.vscrollOn && this.vscrollbar) {
                        if (this.vscrollbar.isVisible()) this.vscrollbar.hide();

                        delete this.vscrollbar._suppressSetThumb;
                        delete this.vscrollbar._suppressImageResize;
                        this.vscrollbar._showWithMaster = true;

                        if (this.vscrollbar.thumb) {
                            delete this.vscrollbar.thumb.suppressImageResize;
                        }
                        if (info._slideOut) {
                            this.vscrollbar.scrollTo(0,0);
                            this.vscrollbar.setHeight(this.getHeight());
                            if (this.vscrollbar.thumb) this.vscrollbar.thumb.scrollTo(0,0);
                        }
                    }
                    // catch the case where we slid the body out of view, leaving just the
                    // breadth scrollbar visible
                    if (this.hscrollOn && this.hscrollbar) {
                        if (this.hscrollbar.isVisible()) this.hscrollbar.hide();
                        this.hscrollbar._showWithMaster = true;
                        delete this.hscrollbar._suppressImageResize;
                        if (info._slideOut) this.hscrollbar.scrollTo(0,0);
                        if (this.hscrollbar.thumb) {
                            delete this.hscrollbar.thumb._suppressImageResize;
                            if (info._slideOut) this.hscrollbar.thumb.scrollTo(0,0);
                        }
                    }
                } else {
                    if (this.hscrollOn && this.hscrollbar) {
                        if (this.hscrollbar.isVisible()) this.hscrollbar.hide();
                        delete this.hscrollbar._suppressSetThumb;
                        delete this.hscrollbar._suppressImageResize;
                        this.hscrollbar._showWithMaster = true;
                        if (this.hscrollbar.thumb)
                            delete this.hscrollbar._suppressImageResize;
                        if (info._slideOut) {
                            this.hscrollbar.scrollTo(0,0);
                            this.hscrollbar.setWidth(this.getWidth());
                            if (this.hscrollbar.thumb) this.hscrollbar.thumb.scrollTo(0,0);
                        }
                    }
                    if (this.vscrollOn && this.vscrollbar) {
                        if (this.vscrollbar.isVisible()) this.vscrollbar.hide();
                        this.vscrollbar._showWithMaster = true;
                        delete this.vscrollbar._suppressImageResize;
                        if (info._slideOut) this.vscrollbar.scrollTo(0,0);
                        if (this.vscrollbar.thumb) {
                            if (info._slideOut) this.vscrollbar.thumb.scrollTo(0,0);
                            delete this.vscrollbar._suppressImageResize;
                        }
                    }
                }

                // no need to reset the size /position of the scrollbars -
                // this will happen automatically  when adjustOverflow runs
            }


            // reset the size (will also resize the edge if necessary)
            this.resizeTo(info._specifiedWidth, info._specifiedHeight);
            this._userHeight = info._userHeight;
            this._userWidth = info._userWidth;
            if (info._slideOut) this.scrollTo((vertical ? null : info._scrollStart),
                                              (vertical ? info._scrollStart : null));
            if (info._callback) {
                this._fireAnimationCompletionCallback(info._callback, earlyFinish, true);
            }
        }
    },

    // animateHide always falls through to this callback regardless of the effect used
    _animateHideComplete : function (earlyFinish) {
        delete this._animatingHide;
        var callback = this._animateHideCallback;
        delete this._animateHideCallback;

        // Fade / fly animations don't actually hide the widget, so call hide() now if we're
        // still visible
        // Note that this IS handled during wipe / slide hide animations by fireAnimationHide()
        // with ratio 1.
        if (this.isVisible()) this.hide();

        // reset anything we altered during the hide
        if (this._performingFadeHide) {
            this.setOpacity(this._fadeHideOpacity);
            delete this._fadeHideOpacity;
            delete this._performingFadeHide;
        }
        if (this._flyHideLeft != null) {
            this.setLeft(this._flyHideLeft);
            delete this._flyHideLeft;
        }
        if (this._flyHidePercentLeft != null) {
            this._percent_left = this._flyHidePercentLeft;
            delete this._flyHidePercentLeft;
        }

        // Always fire the callback passed in synchronously - this is itself a callback so
        // will have already been delayed if synchronousCallback was not set on the animation
        // config object
        if (callback) {
            this._fireAnimationCompletionCallback(callback, earlyFinish, true);
        }
    },


    //> @method canvas.isAnimating()
    // Is this widget currently performing an animation?
    // @param [types] (array) Animation types to check for - if unspecified all animation types
    //   will be checked.
    // @visibility internal
    //<

    isAnimating : function (types) {
        if (types == null) return this._runningAnimations > 0;

        if (types && !isc.isAn.Array(types)) {
            // reuse an array for efficiency
            if (!this._animatingTypesArray) this._animatingTypesArray = [];
            this._animatingTypesArray[0] = types;
            types = this._animatingTypesArray;
        }

        if (!types) types = this._animations;
        for (var i = 0; i < types.length; i++) {
            if (this[this._getAnimationID(types[i])] != null) {
//                this.logWarn("ID:" + this._getAnimationID(types[i]) +
//                    "set to:"  + this[this._getAnimationID(types[i])]);
                return true;
            }
        }
        return false;
    }

});








//>    @class    StatefulCanvas
// A component that has a set of possible states, and which presents itself differently according to
// which state it is in.  An example is a button, which can be "up", "down", "over" or "disabled".
//
// @treeLocation Client Reference/Foundation
// @visibility external
//<
isc.ClassFactory.defineClass("StatefulCanvas", "Canvas");

    //>    @groupDef    state
    // Change of state and it's consequences for presentation.
    //<
isc.StatefulCanvas.addClassProperties({

    //>    @type    State
    // Constants for the standard states for a StatefulCanvas.
    //            @group    state
    STATE_UP:"",                //    @value    StatefulCanvas.STATE_UP         state when mouse is not acting on this StatefulCanvas
    STATE_DOWN:"Down",            //    @value    StatefulCanvas.STATE_DOWN       state when mouse is down
    STATE_OVER:"Over",            //    @value    StatefulCanvas.STATE_OVER        state when mouse is over
    STATE_DISABLED:"Disabled",    //    @value    StatefulCanvas.STATE_DISABLED    disabled
    // @visibility external
    //<

    //>    @type    SelectionType
    // Controls how an object changes state when clicked
    // @group    state
    // @group    event handling
    //    @value    StatefulCanvas.BUTTON    object moves to "down" state temporarily (normal button)
    //    @value    StatefulCanvas.CHECKBOX object remains in "down" state until clicked again (checkbox)
    //    @value    StatefulCanvas.RADIO    object moves to "down" state, causing another object to go up (radio)
    BUTTON:"button",
    CHECKBOX:"checkbox",
    RADIO:"radio",
    // @visibility external
    //<

    //>    @type    Selected
    //            @group    state
    FOCUSED:"Focused",          //  @value  StatefulCanvas.FOCUSED  StatefulCanvas should show
                                // focused state
    SELECTED:"Selected",        //    @value    StatefulCanvas.SELECTED        StatefulCanvas is selected
    UNSELECTED:"",                //    @value    StatefulCanvas.UNSELECTED   StatefulCanvas is not selected
    // @visibility external
    //<

    // Internal map of radioGroup ID's to arrays of widgets
    _radioGroups:{},

    // ------------------------
    // Properties for manipulating CSS border

    _borderStyleCache: {},
    _borderCSSHTMLCache: {},

    _borderProperties : [
        "borderBottomLeftRadius",
        "borderBottomRightRadius",
        "borderTopRightRadius",
        "borderTopLeftRadius",
        "borderBottomColor",
        "borderBottomStyle",
        "borderBottomWidth",
        "borderLeftColor",
        "borderLeftStyle",
        "borderLeftWidth",
        "borderRightColor",
        "borderRightStyle",
        "borderRightWidth",
        "borderTopColor",
        "borderTopStyle",
        "borderTopWidth"
    ],
    _nRadiusBorderProperties: 4,

    _$separator: " ",

    //> @attr statefulCanvas.pushTableBorderStyleToDiv (boolean : ? : IR)
    // Causes border properties to be written onto containing DIV rather than
    // be applied to the internal Table TDs for Button widgets
    //<
    pushTableBorderStyleToDiv: isc.Browser.isIE9
});


isc.StatefulCanvas.addProperties({

    //>    @attr statefulCanvas.title        (HTMLString : varies : [IRW])
    // The text title to display in this button.
    // @group basics
    // @visibility external
    //<

    //>@attr StatefulCanvas.hiliteAccessKey (boolean : null : [IRWA])
    // If set to true, if the +link{statefulCanvas.title, title} of this button contains the
    // specified +link{canvas.accessKey, accessKey}, when the title is displayed to the user
    // it will be modified to include HTML to underline the accessKey.<br>
    // Note that this property may cause titles that include HTML (rather than simple strings)
    // to be inappropriately modified, so should be disabled if your title string includes
    // HTML characters.
    // @visibility internal
    //<

    // State-related properties
    // -----------------------------------------------------------------------------------------------

    //>    @attr    statefulCanvas.redrawOnStateChange        (Boolean : false : IRWA)
    // Whether this widget needs to redraw to reflect state change
    // @group    state
    // @visibility external
    //<

    //>    @attr    statefulCanvas.selected        (Boolean : false : IRW)
    // Whether this component is selected.  For some components, selection affects appearance.
    // @group    state
    // @visibility external
    //<

    //>    @attr    statefulCanvas.state        (State : "" : IRWA)
    // Current "state" of this widget. StatefulCanvases will have a different appearance based
    // on their current state. By default this is handled by changing the css className applied to
    // the StatefulCanvas - see +link{StatefulCanvas.baseStyle} for a description of how this is
    // done.<P>
    // For +link{class:Img} or +link{class:StretchImg} based subclasses of StatefulCanvas, the
    // appearance may also be updated by changing the src of the rendered image. See
    // +link{Img.src} and +link{StretchImgButton.src} for a description of how the URL
    // is modified to reflect the state of the widget in this case.
    //
    // @see type:State
    // @see group:state
    // @group    state
    // @visibility external
    //<
    state:"",

    //>    @attr    statefulCanvas.showRollOver        (Boolean : false : IRW)
    // Should we visibly change state when the mouse goes over this object?
    // @group    state
    // @visibility external
    //<

    //>    @attr    statefulCanvas.showFocus        (Boolean : false : IRW)
    // Should we visibly change state when the canvas receives focus?  Note that by default the
    // <code>over</code> state is used to indicate focus.
    // @group    state
    // @deprecated as of SmartClient version 6.1 in favor of +link{statefulCanvas.showFocused}
    // @visibility external
    //<

    //>    @attr    statefulCanvas.showFocused        (Boolean : false : IRW)
    // Should we visibly change state when the canvas receives focus?  If
    // +link{statefulCanvas.showFocusedAsOver} is <code>true</code>, the <b><code>"over"</code></b>
    // will be used to indicate focus. Otherwise a separate <b><code>"focused"</code></b> state
    // will be used.
    // @group    state
    // @visibility external
    //<

    //> @attr statefulCanvas.showFocusedAsOver (Boolean : true : IRW)
    // If +link{StatefulCanvas.showFocused,showFocused} is true for this widget, should the
    // <code>"over"</code> state be used to indicate the widget as focused. If set to false,
    // a separate <code>"focused"</code> state will be used.
    // @group state
    // @visibility external
    //<
    showFocusedAsOver: true,



    //>    @attr    statefulCanvas.showDown        (Boolean : false : IRW)
    // Should we visibly change state when the mouse goes down in this object?
    //        @group    state
    // @visibility external
    //<

    //>    @attr    statefulCanvas.showDisabled  (Boolean : true : IRW)
    // Should we visibly change state when disabled?
    //        @group    state
    // @visibility external
    //<
    showDisabled:true,

    //>    @attr    statefulCanvas.actionType        (SelectionType : "button": IRW)
    // Behavior on state changes -- BUTTON, RADIO or CHECKBOX
    //        @group    state
    //        @group    event handling
    //      @setter setActionType()
    //      @getter getActionType()
    // @visibility external
    //<
    actionType:"button",

    //>    @attr    statefulCanvas.radioGroup   (string : null : IRWA)
    // String identifier for this canvas's mutually exclusive selection group.
    //        @group    state
    //        @group    event handling
    // @visibility external
    //<

    //>    @attr    statefulCanvas.baseStyle        (CSSStyleName : null : IRW)
    // Base CSS style.  As the component changes state and/or is selected, suffixes will be
    // added to the base style.
    // <P>
    // When the component changes state (eg becomes disabled), a suffix will be appended to this
    // style name, reflecting the following states: "Over", "Down", or "Disabled".
    // <P>
    // If the widget is selected, the suffixes will be "Selected", "SelectedOver", etc.
    // <P>
    // If the widget has focus and +link{StatefulCanvas.showFocused} is true, and
    // +link{StatefulCanvas.showFocusedAsOver} is false, the suffixes will be "Focused",
    // "FocusedOver", etc, or if the widget is both selected and focused, "SelectedFocused",
    // "SelectedFocusedOver", etc.
    // <P>
    // For example, if <code>baseStyle</code> is set to "button", this component is
    // +link{isSelected,selected} and the mouse cursor is over this component, the style
    // "buttonSelectedOver" will be used.
    //
    // @visibility external
    //<


    //>    @attr    statefulCanvas.cursor        (Cursor : Canvas.ARROW : IRW)
    //            Specifies the cursor to show when over this canvas.
    //            See Cursor type for different cursors.
    //        @group    cues
    //        @platformNotes    Nav4    Cursor changes are not available in Nav4
    //<
    cursor:isc.Canvas.ARROW,

    //>    @attr    statefulCanvas._savedCursor        (Cursor : null : IRWA)
    //            Any special cursor for this canvas is deactivated when this
    //            canvas is disable()'d. So, we keep that cursor setting here
    //            so that if and when the canvas is enabled() once again, it
    //            will have the proper cursor.
    //        @group    state, event handling
    //<
    //_savedCursor:null,

    // Image-based subclasses
    // ---------------------------------------------------------------------------------------
    capSize:0,

    //> @attr statefulCanvas.showTitle (boolean : false : [IRWA])
    // Determines whether any specified +link{statefulCanvas.getTitle(), title} will be
    // displayed for this component.<br>
    // Applies to Image-based components only, where the title will be rendered out in a label
    // floating over the component
    // @visibility internal
    //<
    // Really governs whether a label canvas is created to contain the title.
    // Exposed on img based subclasses only as some statefulCanvas subclasses will support
    // displaying the title without a label canvas
    //showTitle:false,

    //>    @attr    statefulCanvas.align        (Alignment : isc.Canvas.CENTER : [IRW])
    // Horizontal alignment of this component's title.
    // @group appearance
    // @visibility external
    //<
    align:isc.Canvas.CENTER,

    //>    @attr    statefulCanvas.valign        (VerticalAlignment : isc.Canvas.CENTER : [IRW])
    // Vertical alignment of this component's title.
    // @group appearance
    // @visibility external
    //<
    valign:isc.Canvas.CENTER,

    //> @attr StatefulCanvas.autoFit  (boolean : null : IRW)
    // If true, ignore the specified size of this widget and always size just large
    // enough to accommodate the title.  If <code>setWidth()</code> is explicitly called on an
    // autoFit:true button, autoFit will be reset to <code>false</code>.
    // <P>
    // Note that for StretchImgButton instances, autoFit will occur horizontally only, as
    // unpredictable vertical sizing is likely to distort the media. If you do want vertical
    // auto-fit, this can be achieved by simply setting a small height, and having
    // overflow:"visible"
    // @setter StatefulCanvas.setAutoFit()
    // @group sizing
    // @visibility external
    //<
    //autoFit:null

    // autoFitDirection: Undocumented property determining whether we should auto-fit
    // horizontally, vertically or in both directions
    // Options are "both", "horizontal", "vertical"
    autoFitDirection:isc.Canvas.BOTH,

    //
    // Button properties - managed here and @included from Button, ImgButton and
    // StatefulImgButton
    // =================================================================================

    // Icon (optional)
    // ---------------

    //> @attr statefulCanvas.icon           (SCImgURL : null : [IRW])
    // Optional icon to be shown with the button title text.
    // <P>
    // Specify as the partial URL to an image, relative to the imgDir of this component.
    // @group buttonIcon
    // @visibility external
    //<

    //> @attr statefulCanvas.iconSize       (int : 16 : [IR])
    // Size in pixels of the icon image.
    // <P>
    // The <code>iconWidth</code> and <code>iconHeight</code> properties can be used to
    // configure width and height separately.
    //
    // @group buttonIcon
    // @visibility external
    //<
    iconSize:16,

    //> @attr statefulCanvas.iconWidth      (integer : null : [IR])
    // Width in pixels of the icon image.
    // <P>
    // If unset, defaults to <code>iconSize</code>
    //
    // @group buttonIcon
    // @visibility external
    //<

    //> @attr statefulCanvas.iconHeight     (integer : null : [IR])
    // Height in pixels of the icon image.
    // <P>
    // If unset, defaults to <code>iconSize</code>
    //
    // @group buttonIcon
    // @visibility external
    //<

    //> @attr statefulCanvas.iconOrientation     (string : "left" : [IR])
    // If this button is showing an icon should it appear to the left or right of the title?
    // valid options are <code>"left"</code> and <code>"right"</code>.
    //
    // @group buttonIcon
    // @visibility external
    //<
    iconOrientation:"left",

    //> @attr statefulCanvas.iconAlign     (string : null : [IR])
    // If this button is showing an icon should it be right or left aligned?
    //
    // @group buttonIcon
    // @visibility internal
    //<
    // Behavior is as follows - if iconOrientation and iconAlign are both left or both right we
    // write the icon out at the extreme right or left of the button, and allow the title to
    // aligned independently of it. (otherwise the icon and the text will be adjacent, and
    // aligned together based on the button's "align" property.


    //> @attr statefulCanvas.iconSpacing   (int : 6 : [IR])
    // Pixels between icon and title text.
    //
    // @group buttonIcon
    // @visibility external
    //<
    iconSpacing:6,

    // internal: controls whether we apply any state to the icon at all
    showIconState: true,

    //> @attr statefulCanvas.showDisabledIcon   (Boolean : true : [IR])
    // If using an icon for this button, whether to switch the icon image if the button becomes
    // disabled.
    //
    // @group buttonIcon
    // @visibility external
    //<
    showDisabledIcon:true,

    //> @attr statefulCanvas.showRollOverIcon   (Boolean : false : [IR])
    // If using an icon for this button, whether to switch the icon image on mouse rollover.
    //
    // @group buttonIcon
    // @visibility external
    //<

    //> @attr statefulCanvas.showDownIcon       (Boolean : false : [IR])
    // If using an icon for this button, whether to switch the icon image when the mouse goes
    // down on the button.
    //
    // @group buttonIcon
    // @visibility external
    //<

    //> @attr statefulCanvas.showSelectedIcon   (Boolean : false : [IR])
    // If using an icon for this button, whether to switch the icon image when the button
    // becomes selected.
    //
    // @group buttonIcon
    // @visibility external
    //<

    //> @attr StatefulCanvas.showFocusedIcon (Boolean : false : [IR])
    // If using an icon for this button, whether to switch the icon image when the button
    // receives focus.
    // <P>
    // If +link{statefulCanvas.showFocusedAsOver} is true, the <code>"Over"</code> icon will be
    // displayed when the canvas has focus, otherwise a separate <code>"Focused"</code> icon
    // will be displayed
    // @group buttonIcon
    // @visibility external
    //<

    // ---------------------------------------------------------------------------------------

    // doc'd only on StretchImg
    gripImgSuffix:"grip",

    // ---------------------------------------------------------------------------------------

    //> @attr statefulCanvas.showOverCanvas (Boolean  : false : [IRWA])
    // When this property is set to true, this widget will create and show the
    // +link{StatefulCanvas.overCanvas} on user rollover.
    // @visibility external
    //<

    //> @attr statefulCanvas.overCanvas (AutoChild Canvas : null : [R])
    // Auto generated child widget to be shown when the user rolls over this canvas if
    // +link{StatefulCanvas.showOverCanvas} is true. See documentation for +link{type:AutoChild}
    // for information on how to customize this canvas.
    // @visibility external
    //<

    //> @attr statefulCanvas.overCanvasConstructor (String : "Canvas" : [IRWA])
    // Constructor class name for this widget's +link{statefulCanvas.overCanvas,overCanvas}
    // @visibility external
    //<
    overCanvasConstructor: "Canvas",

    //> @attr statefulCanvas.overCanvasDefaults (Canvas : { ... } : [IRWA])
    // Default properties for this widgets +link{statefulCanvas.overCanvas,overCanvas}. To modify
    // these defaults, use +link{Class.changeDefaults()}
    // @visibility external
    //<
    overCanvasDefaults: {
        // override mouseOut to hide this canvas if the user rolls off it and out of the
        // parent/constructor
        mouseOut:function () {
            if (isc.EH.getTarget() != this.creator) this.clear();
            return this.Super("mouseOut", arguments);
        }
    }


});

isc.StatefulCanvas.addMethods({

//>    @method    statefulCanvas.init()    (A)
// Initialize this StatefulCanvas. Pass in objects with properties to add or override defaults.
//
//        @param    [all arguments]    (object)    objects with properties to override from default
//<
initWidget : function () {


    if (this.src == null) this.src = this.vertical ? this.vSrc : this.hSrc;

    var isEnabled = !this.isDisabled();

    // the enabled property also affects the state of this object
    if (!isEnabled) {
        this._enabledState = this.state;
        if (this.showDisabled) this.state = isc.StatefulCanvas.STATE_DISABLED;
    }

    // if className has been specified and baseStyle has no default, copy className to
    // baseStyle.  This is needed for the Label where you are expected to set className, not
    // baseStyle.
    // From then on the current className will be derived from the baseStyle setting plus the
    // current state, unless the widget suppresses className, which it may do if it has another
    // element the receives the baseStyle, and it leaves the handle unstyled.
    this.baseStyle = this.baseStyle || this.className;
    this.styleName = (this.suppressClassName ? null : this.getStateName());
    this.className = this.styleName;

    // If this button has a radioGroup ID specified, update the array of widgets in the
    // radiogroup to include this one.
    if (this.radioGroup != null) {

        var rg = this.radioGroup;
        // clear out the property to avoid a no-op, then add with the standard setter
        this.radioGroup = null;
        this.addToRadioGroup(rg);
    }

    // Initialize autoFit
    this.setAutoFit(this.autoFit, true);

    if (this.showGrip) {
        // use the icon functionality of the label to show an image floated over center (this
        // is mutex with using the icon / label functionality, but most such uses don't make
        // much sense)
        this.showTitle = true;
        this.labelVPad = 0;
        this.labelHPad = 0;
        this.iconSpacing = 0;
        this.align = isc.Canvas.CENTER;
        // get the URL for a piece named "grip".  NOTE: resolve to a fully qualified URL now,
        // in the same imgDir context as the rest of the pieces, as opposed to the labels
        this.icon = this.getImgURL(this.getURL(this.gripImgSuffix));

        // NOTE: grip* sizing is intentionally null by default, so we get the image's natural
        // size, overriding the icon defaults.
        this.iconSize = this.gripSize;
        this.iconWidth = this.vertical ? this.gripBreadth : this.gripLength;
        this.iconHeight = this.vertical ? this.gripLength : this.gripBreadth;

        this.showRollOverIcon = this.showRollOverGrip;
        this.showDownIcon  = this.showDownGrip;
    }

    var showingLabel = this.shouldShowLabel();
    if (showingLabel) this.makeLabel();

    if (isc.screenReader && !showingLabel && !this.showGrip && (this.prompt || this.title)) {

        var label = this.getAriaLabel();

        // avoid writing out the default "Untitled Button" (or it's i18n replacement)
        if (label != null) {
            //this.logWarn("aria-label set to: " + label);
            this.ariaState = isc.addProperties({}, this.ariaState, { label : label });
        }
    }
},

getAriaLabel : function () {
    var label = this.prompt || this.title;

    // avoid writing out the default "Untitled Button" (or it's i18n replacement)
    if (label != null && label != "" && isc.Button.getInstanceProperty("title") != label)
    {
        return label;
    }
    return null;
},

//>    @method    statefulCanvas.getURL()
// Get the URL for an image based on this.src as modified by the piece name and state.
//
//            eg if:        .src         = "foo.gif"
//                        pieceName     = "start"
//                        state        = "down"
//
//            url =         foo_down_start.gif
//
// @param    [pieceName]    (string : "")                 name for part of the image
// @param    [state]        (string : this.state)        state of the image ("up", "off", etc.)
// @param    [selected]    (boolean : this.selected)    whether or not image is also in the
//                                                      "selected" state
// @param  [focused]   (boolean)
//   Whether this image should be rendered in the "focused" state. Defaults to true if
//   this Img has focus and +link{StatefulCanvas.showFocused,this.showFocused} is true and
//   +link{StatefulCanvas.showFocusedAsOver,this.showFocusedAsOver} is false.
//
// @return (SCImgURL) URL for the image
//<
getURL : function (pieceName, state, selected, focused) {
    return isc.Img.urlForState(this.src,
                           selected != null ? selected : this.selected,
                           focused != null ? focused : this.getFocusedState(),
                           state != null ? state : this.state,
                           pieceName,
                           this.getCustomState());
},

//> @method StatefulCanvas.shouldShowLabel()
// Should this widget create a floating label for textual content - used for image based widgets.
// Default implementation returns this.showTitle
// @return (boolean) true if the floating label should be created
//<
shouldShowLabel : function () {
    return this.showTitle;

},

// State
// ------------------------------------------------------------------------------------------------------
// set the state for this object, and whether or not it is selected

_$visualState:"visualState",
stateChanged : function () {

    if (this.destroyed) return;

    if (this.logIsDebugEnabled(this._$visualState)) {
        this.logDebug("state changed to: " + this.getStateName(), "visualState");
    }

    if (this.redrawOnStateChange) {
        this.markForRedraw("state change");
    }
    // NOTE: a redraw doesn't update className
    if (!this.suppressClassName) {
        this.setClassName(this.getStateName());
    }

    // set our label to the same state (note it potentially has independent styling)
    var label = this.label;
    if (label != null) {
        label.setState(this.getState());
        label.setSelected(this.isSelected());
        label.setCustomState(this.getCustomState());
    }
},

//>    @method statefulCanvas.setBaseStyle()
// Sets the base CSS style.  As the component changes state and/or is selected, suffixes will be
// added to the base style.
// @visibility external
// @param style (className) new base style
//<
setBaseStyle : function (style) {
    if (this.baseStyle == style) return;
    this.baseStyle = style;
    if (this.label && this.titleStyle == null) this.label.setBaseStyle(style);
    // fall through to stateChanged to actually update the appearance
    this.stateChanged();
},


setTitleStyle : function (style) {
    if (this.titleStyle == style) return;
    this.titleStyle = style;
    if (this.label) {
        this.label.setBaseStyle(style || this.baseStyle);
    }
    this.stateChanged();
},

//>    @method    statefulCanvas.setState()    (A)
// Set the 'state' of this object, changing its appearance.
//
//        @group    state
//      @group appearance
//
//        @see     setDisabled() which also affects state values.
//
//        @param    newState        (State)    new state
// @visibility external
//<
setState : function (newState) {
    if (this.state == newState) return;
    this.state = newState;
    this.stateChanged();    // update the appearance - redraw if necessary
},

_updateChildrenTopElement : function () {
    this.Super("_updateChildrenTopElement", arguments);
    this.setHandleDisabled(this.isDisabled());
},

//>    @method    statefulCanvas.getState()    (A)
// Return the state of this StatefulCanvas
//        @group    state
//
// @visibility external
// @return (State)
//<
getState : function () {
    return this.state;
},

//>    @method    statefulCanvas.setSelected()
// Set this object to be selected or deselected.
//        @group    state
//
//        @param    newIsSelected    (boolean)    new boolean value of whether or not the object is
//                                          selected.
// @visibility external
//<
setSelected : function (newIsSelected) {
    if (this.selected == newIsSelected) return;

    // handle mutually exclusive radioGroups
    if (newIsSelected && this.radioGroup != null) {
        var groupArray = isc.StatefulCanvas._radioGroups[this.radioGroup];
        // catch the (likely common) case of this.radioGroup being out of synch - implies
        // a developer has assigned directly to this.radioGroup without calling the setter
        if (groupArray == null) {
            this.logWarn("'radioGroup' property set for this widget, but no corresponding group " +
                         "exists. To set up a new radioGroup containing this widget, or add this " +
                         " widget to an existing radioGroup at runtime, call 'addToRadioGroup(groupID)'");
        } else {
            for (var i = 0; i < groupArray.length; i++) {
                if (groupArray[i]!= this && groupArray[i].isSelected())
                    groupArray[i].setSelected(false);
            }
        }
    }

    this.selected = newIsSelected;

    if (this.label) this.label.setSelected(this.isSelected());

    this.stateChanged();
},

//>    @method    statefulCanvas.select()
// Select this object.
//        @group    state
// @visibility external
//<
select : function () {
    this.setSelected(true);
},

//>    @method    statefulCanvas.deselect()
// Deselect this object.
//        @group    state
// @visibility external
//<
deselect : function () {
    this.setSelected(false);
},

//>    @method    statefulCanvas.isSelected()
// Find out if this object is selected
//        @group    state
//        @return (Boolean)
// @visibility external
//<
isSelected : function () {
    return this.selected;
},

// actionType - determines whether the button will select / deselect on activation

//>    @method    statefulCanvas.getActionType() (A)
// Return the 'actionType' for this canvas (radio / checkbox / button)
//      @group  state
//      @group event handling
//      @visibility external
//<
getActionType : function () {
    return this.actionType;
},

//>    @method    statefulCanvas.setActionType() (A)
// Update the 'actionType' for this canvas (radio / checkbox / button)
// If the canvas is currently selected, and the passed in actionType is 'button'
// this method will deselect the canvas.
//      @group  state
//      @group event handling
//      @visibility external
//<
setActionType : function (actionType) {
    if (actionType == isc.StatefulCanvas.BUTTON && this.isSelected()) {
        this.setSelected(false);
    }
    this.actionType = actionType;
},

// radioGroups - automatic handling for mutually exclusive selection behavior between buttons

//>    @method    statefulCanvas.addToRadioGroup(groupID) (A)
// Add this widget to the specified mutually exclusive selection group with the ID
// passed in.
// Selecting this widget will then deselect any other StatefulCanvases with the same
// radioGroup ID.
// StatefulCanvases can belong to only one radioGroup, so this method will remove from
// any other radiogroup of which this button is already a member.
//      @group  state
//      @group event handling
//      @param  groupID (string)    - ID of the radiogroup to which this widget should be added
//      @visibility external
//<
addToRadioGroup : function (groupID) {
    // Bail if groupID is null, or if we already belong to the specified group, so we don't
    // get duplicated in the array
    if (groupID == null || this.radioGroup == groupID) return;

    if (this.radioGroup != null) this.removeFromRadioGroup();

    this.radioGroup = groupID;

    // update the widget array for the specified group (stored on the Class object)
    if (isc.StatefulCanvas._radioGroups[this.radioGroup] == null) {
        isc.StatefulCanvas._radioGroups[this.radioGroup] = [this];
    } else {
        isc.StatefulCanvas._radioGroups[this.radioGroup].add(this);
    }

},

//>    @method    statefulCanvas.removeFromRadioGroup(groupID) (A)
// Remove this widget from the specified mutually exclusive selection group with the ID
// passed in.
// No-op's if this widget is not a member of the groupID passed in.
// If no groupID is passed in, defaults to removing from whatever radioGroup this widget
// is a member of.
//      @group  state
//      @group event handling
//      @visibility external
//      @param  [groupID]   (string)    - optional radio group ID (to ensure the widget is removed
//                                        from the appropriate group.
//<
removeFromRadioGroup : function (groupID) {
    // if we're passed the ID of a group we're not a member of, just bail
    if (this.radioGroup == null || (groupID != null && groupID != this.radioGroup)) return;

    var widgetArray = isc.StatefulCanvas._radioGroups[this.radioGroup];

    widgetArray.remove(this);

    delete this.radioGroup;

},

// Enable/Disable
// ------------------------------------------------------------------------------------------------------
//    to have an object redraw when it's enabled, set:
//        .redrawOnDisable = true

//>    @method    statefulCanvas.setDisabled()
// Enable or disable this object
//        @group enable, state
//
//    @param    disabled (boolean) true if this widget is to be disabled
// @visibility external
//<
// actually implemented on Canvas, calls setHandleDisabled()

setHandleDisabled : function (disabled,b,c,d) {
    this.invokeSuper(isc.StatefulCanvas, "setHandleDisabled", disabled,b,c,d);

    if (!this.showDisabled) return;

    // clear/restore the cursor and set the StatefulCanvas.STATE_DISABLED/StatefulCanvas.STATE_UP states.
    var handleIsDisabled = (this.state == isc.StatefulCanvas.STATE_DISABLED);
    if (handleIsDisabled == disabled) return;

    if (disabled == false) {
        if (this._savedCursor) this.setCursor(this._savedCursor);
        var enabledState = this._enabledState || isc.StatefulCanvas.STATE_UP;
        this.setState(enabledState);
    } else {
        this._savedCursor = this.cursor;
        this.setCursor(isc.StatefulCanvas.ARROW);
        // hang onto the enable state so that when we're next enabled we can reset to it.
        this._enabledState = this.state;
        this.setState(isc.StatefulCanvas.STATE_DISABLED);
    }
},


// CSS Style methods
// ------------------------------------------------------------------------------------------
// methods that allow style to change according to state.

//>    @method    statefulCanvas.getStateName()    (A)
// Get the CSS styleName that should currently be applied to this component, reflecting
// <code>this.baseStyle</code> and the widget's current state.
// <P>
// NOTE: this can differ from the style currently showing if the component has not yet updated
// it's visual state after a state change.
//
//        @group    appearance
//        @return    (CSSStyleName)    name of the style to set the StatefulCanvas to
//<
getStateName : function () {
    var modifier = this.getStateSuffix();
    if (modifier) return this.baseStyle + modifier;
    return this.baseStyle;
},

getTitleStateName : function () {

    if (!this.titleStyle) return null;
    return this.titleStyle + (this.isDisabled() ? isc.StatefulCanvas.STATE_DISABLED : isc.emptyString);
},

//>    @method    statefulCanvas.getStateSuffix()
// Returns the suffix that will be appended to the +link{StateFulCanvas.baseStyle}
// as the component changes state and/or is selected.
// <P>
// When the component changes state (eg becomes disabled), a suffix will be appended to this
// style name, reflecting the following states: "Over", "Down", or "Disabled".
// <P>
// If the widget is selected, the suffixes will be "Selected", "SelectedOver", etc.
// <P>
// If the widget has focus and +link{StatefulCanvas.showFocused} is true, and
// +link{StatefulCanvas.showFocusedAsOver} is false, the suffixes will be "Focused",
// "FocusedOver", etc, or if the widget is both selected and focused, "SelectedFocused",
// "SelectedFocusedOver", etc.
// <P>
// For example, if <code>baseStyle</code> is set to "button", this component is
// +link{isSelected,selected} and the mouse cursor is over this component, the style
// "buttonSelectedOver" will be used.
//
// @return (String) suffix to be appended to the baseStyle
//
// @visibility external
//<
getStateSuffix : function () {
    var state = this.getState(),
        selected = this.isSelected() ? isc.StatefulCanvas.SELECTED : null,
        focused = this.getFocusedState() ? isc.StatefulCanvas.FOCUSED : null,
        customState = this.getCustomState();
    return this._getStateSuffix(state,selected,focused,customState);
},

_getStateSuffix : function (state, selected, focused, customState) {

    var modifier;
    if (selected || focused) {
        modifier = (selected && focused) ? this._$SelectedFocused :
                                                selected ? selected : focused;
    }
    if (!customState) {
        if (modifier) return state ? modifier + state : modifier;
        else return state;
    } else if (modifier) {
        return state ? modifier + state + customState : modifier + customState;
    } else {
        return state ? state + customState : customState;
    }
},
_$SelectedFocused:"SelectedFocused",

setCustomState : function (customState) {
    if (customState == this.customState) return;
    this.customState = customState;
    this.stateChanged();
},
getCustomState : function () { return this.customState },

// Override getPrintStyleName to pick up the current stateName rather than this.styleName which
// may have been cleared (EG suppressClassName is true)
getPrintStyleName : function () {
    return this.printStyleName || this.getStateName();
},

// Label
// ---------------------------------------------------------------------------------------

labelDefaults : {
    _isStatefulCanvasLabel: true,
    _canFocus : function () { return this.masterElement._canFocus(); },
    focusChanged : function (hasFocus) {
        if (this.hasFocus) this.eventProxy.focus();
    },

    getContents : function () { return this.masterElement.getTitleHTML() },

    // override adjustOverflow to notify us when this has it's overflow changed
    // (probably due to 'setContents')
    adjustOverflow : function (a,b,c,d) {
        this.invokeSuper(null, "adjustOverflow", a,b,c,d);
        if (this.masterElement) this.masterElement._labelAdjustOverflow();
    }
},

_$label : "label",
makeLabel : function () {
    var labelClass = this.getAutoChildClass(this._$label, null, isc.Label);

    var label = labelClass.createRaw();

    label.clipTitle = this.clipTitle;
    // handle the clipped title hover ourselves
    label.showClippedTitleOnHover = false;
    label._canHover = false;

    if (this._getAfterPadding != null) {
        label._getAfterPadding = function () {
            return this.masterElement._getAfterPadding();
        };
    }

    label.align = this.align;
    label.valign = this.valign;

    label._resizeWithMaster = false;
    label._redrawWithMaster = (this._redrawLabelWithMaster != null ? this._redrawLabelWithMaster : false);
    label._redrawWithParent = false;
    label.containedPeer = true;

    // icon-related
    label.icon = this.icon;
    label.iconWidth = this.iconWidth;
    label.iconHeight = this.iconHeight;
    label.iconSize = this.iconSize;
    label.iconOrientation = this.iconOrientation;
    label.iconAlign = this.iconAlign;
    label.iconSpacing = this.iconSpacing;
    label.iconStyle = this.iconStyle;
    label.showDownIcon = this.showDownIcon;
    label.showSelectedIcon = this.showSelectedIcon;
    label.showRollOverIcon = this.showRollOverIcon;
    label.showFocusedIcon = this.showFocusedIcon;
    label.showDisabledIcon = this.showDisabledIcon;
    if (this.showIconState != null) label.showIconState = this.showIconState;

    // If we show 'focused' state, have our label show it too.
    label.getFocusedState = function () {
        var button = this.masterElement;
        if (button && button.getFocusedState) return button.getFocusedState();
    }


    // By default we'll apply our skinImgDir to the label - allows [SKIN] to be used
    // in icon src.
    label.skinImgDir = this.labelSkinImgDir || this.skinImgDir;


    label.baseStyle = this.titleStyle || this.baseStyle;
    label.state = this.getState();
    label.customState = this.getCustomState();

    // default printStyleName to this.printStyleName
    label.getPrintStyleName = function () {
        return this.masterElement.getPrintStyleName();
    }

    // if we're set to overflow:visible, that means the label should set to overflow:visible
    // and we should match its overflowed size
    label.overflow = this.overflow;


    label.width = this._getLabelSpecifiedWidth();
    label.height = this._getLabelSpecifiedHeight();
    label.left = this._getLabelLeft();
    label.top = this._getLabelTop();


    // NOTE: vertical always false where inapplicable, eg ImgButton
    label.wrap = this.wrap != null ? this.wrap : this.vertical;

    label.eventProxy = this;

    label.isMouseTransparent = true;

    label.zIndex = this.getZIndex(true) + 1;

    label.tabIndex = -1;

    // finish createRaw()/completeCreation() construction style, but allow autoChild defaults
    this._completeCreationWithDefaults(this._$label, label);

    this.label = isc.SGWTFactory.extractFromConfigBlock(label);

    this.label.setSelected(this.isSelected());


    this.addPeer(this.label, null, null, true);
},


setLabelSkinImgDir : function (dir) {
    this.labelSkinImgDir = dir;
    if (this.label != null) this.label.setSkinImgDir(dir);
},

setSkinImgDir : function (dir) {
    this.Super("setSkinImgDir", arguments);
    if (this.labelSkinImgDir == null && this.label != null) this.label.setSkinImgDir(dir);
},

// Label Sizing Handling
// ---------------------------------------------------------------------------------------

//> @method statefulCanvas.setIconOrientation
// Changes the orientation of the icon relative to the text of the button.
//
// @param orientation ("left" or "right") The new orientation of the icon relative to the text
// of the button.
//
// @group buttonIcon
// @visibility external
//<
setIconOrientation : function (orientation) {
    this.iconOrientation = orientation;
    if (this.label) {
        this.label.iconOrientation = orientation;
        this.label.markForRedraw();
    } else {
        this.markForRedraw();
    }
},

//>@method statefulCanvas.setAutoFit()
// Setter method for the +link{StatefulCanvas.autoFit} property. Pass in true or false to turn
// autoFit on or off. When autoFit is set to <code>false</code>, canvas will be resized to
// it's previously specified size.
// @param autoFit (boolean) New autoFit setting.
// @visibility external
//<
setAutoFit : function (autoFit, initializing) {

    // setAutoFit is called directly from resizeTo
    // If we're resizing before the autoFit property's initial setup, don't re-set the
    // autoFit property.
    if (initializing) {
        this._autoFitInitialized = true;
        // No need to make any changes if autoFit is false
        if (!autoFit) return;
    }

    // This can happen if 'setWidth()' et-al are called during 'init' for the statefulCanvas,
    // and should not effect the autoFit setting.
    if (!this._autoFitInitialized) return;

    // Typecast autoFit to a boolean
    autoFit = !!autoFit;

    // bail if no change to autoFit, unless this is the special init-time call
    if (!initializing && (!!this.autoFit == autoFit)) return;

    this._settingAutoFit = true;
    this.autoFit = autoFit;
    var horizontal = (this.autoFitDirection == isc.Canvas.BOTH) ||
                      (this.autoFitDirection == isc.Canvas.HORIZONTAL),
        vertical = (this.autoFitDirection == isc.Canvas.BOTH) ||
                    (this.autoFitDirection == isc.Canvas.VERTICAL);

    // advertise that we have inherent width/height in whatever directions we are autofitting,
    // iow, a Layout should not expand us along that axis.
    this.inherentWidth = autoFit && horizontal;
    this.inherentHeight = autoFit && vertical;

    if (autoFit) {
        // record original overflow, width and height settings so we can restore them if
        // setAutoFit(false) is called
        this._explicitOverflow = this.overflow;
        this.setOverflow(isc.Canvas.VISIBLE);

        if (horizontal) {
            this._explicitWidth = this.width;
            this.setWidth(1);
        }

        if (vertical) {
            this._explicitHeight = this.height;
            this.setHeight(1);
        }
        //this.logWarn("just set autoFit to:"+ autoFit +
        //     ", width/height/overflow:"+ [this.width, this.height, this.overflow]);

    } else {

        // If we had an explicit height before being set to autoFit true, we should reset to
        // that size, otherwise reset to default.
        var width = this._explicitWidth || this.defaultWidth,
            height = this._explicitHeight || this.defaultHeight;


        if (horizontal) this.setWidth(width);
        if (vertical) this.setHeight(height);

        if (this.parentElement && isc.isA.Layout(this.parentElement)) {
            if (horizontal && !this._explicitWidth) this._userWidth = null;
            if (vertical && !this._explicitHeight) this._userHeight = null;
        }
        this._explicitWidth = null;
        this._explicitHeight = null;
        if (this._explicitOverflow) this.setOverflow(this._explicitOverflow);
        this._explicitOverflow = null;

    }
    delete this._settingAutoFit;
},


// override 'resizeBy()' / 'setOverflow()' - if these methods are called
// we're essentially clearing out this.autoFit
// Note we override resizeBy() as setWidth / setHeight / resizeTo all fall through to this method.
resizeBy : function (dX, dY, a,b,c,d) {

    if (this.autoFit && this._autoFitInitialized && !this._settingAutoFit) {
        var changeAutoFit = false;

        if (dX != null &&
            (this.autoFitDirection == isc.Canvas.BOTH ||
             this.autoFitDirection == isc.Canvas.HORIZONTAL))
        {
            this._explicitWidth = (1 + dX);
            changeAutoFit = true;
            dX = null;
        }
        if (dY != null &&
            (this.autoFitDirection == isc.Canvas.BOTH ||
             this.autoFitDirection == isc.Canvas.VERTICAL))
        {
            this._explicitHeight = (1 + dY);
            changeAutoFit = true;
            dY = null;
        }

        // one or more of the dimensions where we're autofitting has changed.  Disable
        // autoFitting for this dimension - this will call setWidth / height to return to
        // default or pre-autoFit size
        if (changeAutoFit) this.setAutoFit(false);
        // now continue with normal resizeBy logic for other dimension, if it's non-null
    }
    return this.invokeSuper(isc.StatefulCanvas, "resizeBy", dX,dY, a,b,c,d);
},

getLabelHPad : function () {
    if (this.labelHPad != null) return this.labelHPad;
    if (this.vertical) {
        return this.labelBreadthPad != null ? this.labelBreadthPad : 0;
    } else {
        return this.labelLengthPad != null ? this.labelLengthPad : this.capSize;
    }
},

getLabelVPad : function () {
    if (this.labelVPad != null) return this.labelVPad;
    if (!this.vertical) {
        return this.labelBreadthPad != null ? this.labelBreadthPad : 0;
    } else {
        return this.labelLengthPad != null ? this.labelLengthPad : this.capSize;
    }
},

_getLabelLeft : function () {
    var left;

    if (this.isDrawn()) {
        left = (this.position == isc.Canvas.RELATIVE && this.parentElement == null ?
                this.getPageLeft() : this.getOffsetLeft());
    } else {
        left = this.getLeft();
    }

    left += this.getLabelHPad();

    return left;
},

_getLabelTop : function () {
    var top;
    if (this.isDrawn()) {
        top = (this.position == isc.Canvas.RELATIVE && this.parentElement == null ?
               this.getPageTop() : this.getOffsetTop());
    } else {
        top = this.getTop();
    }

    top += this.getLabelVPad();
    return top;
},

_getLabelSpecifiedWidth : function () {
    var width = this.getInnerWidth();
    width -= 2* this.getLabelHPad();

    return Math.max(width, 1);
},

_getLabelSpecifiedHeight : function () {
    var height = this.getInnerHeight();
    height -= 2 * this.getLabelVPad();
    return Math.max(height, 1);
},

// if we are overflow:visible, match the drawn size of the label.
// getImgBreadth/getImgLength return the sizes for the non-stretching and stretching axes
// respectively.
// NOTE that stretching on the breadth axis won't look right with most media sets, eg a
// horizontally stretching rounded button is either going to tile its rounded caps vertically
// (totally wrong) or stretch them, which will probably degrade the media.
getImgBreadth : function () {
    if (this.overflow == isc.Canvas.VISIBLE && isc.isA.Canvas(this.label))
    {
        return this.vertical ? this._getAutoInnerWidth() : this._getAutoInnerHeight();
    }

    //return this.Super("getImgBreadth", arguments);
    // same as the Superclass behavior
    return (this.vertical ? this.getInnerWidth() : this.getInnerHeight());
},

getImgLength : function () {
    if (this.overflow == isc.Canvas.VISIBLE && isc.isA.Canvas(this.label))
    {
        return this.vertical ? this._getAutoInnerHeight() : this._getAutoInnerWidth();
    }
    return (this.vertical ? this.getInnerHeight() : this.getInnerWidth());
},

// get the inner breadth or height we should have if we are overflow:visible and want to size
// to the label and the padding we leave around it
_getAutoInnerHeight : function () {
    var innerHeight = this.getInnerHeight();
    // use the normal inner height if we have no label
    if (!isc.isA.Canvas(this.label)) return innerHeight;

    // if the padding for this dimension is set, use that, otherwise assume the capSize as a
    // default padding for the stretch dimension
    var padding = this.getLabelVPad();
    var labelSize = this.label.getVisibleHeight() + 2*padding;
    return Math.max(labelSize, innerHeight);
},

_getAutoInnerWidth : function () {
    var innerWidth = this.getInnerWidth();
    if (!isc.isA.Canvas(this.label)) return innerWidth;

    var padding = this.getLabelHPad();
    var labelSize = this.label.getVisibleWidth() + 2*padding;
    return Math.max(labelSize, innerWidth);
},


// If we are matching the label size, and it changes, resize images and redraw
_$labelOverflowed:"Label overflowed.",
_labelAdjustOverflow : function () {
    if (this.overflow != isc.Canvas.VISIBLE) return;

    //this.logWarn("our innerWidth:" + this.getInnerWidth() +
    //             ", label visible width: " + this.label.getVisibleWidth() +
    //             " padding: " + (this.labelHPad * 2) +
    //             " resizing to width: " + this.getImgLength());

    // by calling our adjustOveflow, we will re-check the scrollWidth / height which
    // will adjust our size if necessary
    this.adjustOverflow(this._$labelOverflowed);
},

// Override getScrollWidth / Height - if we are overflow:"visible", and have a label we're
// going to size ourselves according to its drawn dimensions
getScrollWidth : function (calcNewValue,B,C,D) {

    if (this.overflow != isc.Canvas.VISIBLE || !isc.isA.Canvas(this.label))
        return this.invokeSuper(isc.StatefulCanvas, "getScrollWidth", calcNewValue,B,C,D);

    if (this._deferredOverflow) {
        this._deferredOverflow = null;
        this.adjustOverflow("widthCheckWhileDeferred");
    }

    if (!calcNewValue && this._scrollWidth != null) return this._scrollWidth;

    // _getAutoInnerWidth() will give us back the greater of our specified size / the
    // label's visible size + our end caps.
    // This is basically our "scroll size" if overflow is visible
    var scrollWidth = this._getAutoInnerWidth()

    return (this._scrollWidth = scrollWidth);
},

getScrollHeight : function (calcNewValue,B,C,D) {

    if (this.overflow != isc.Canvas.VISIBLE || !isc.isA.Canvas(this.label))
        return this.invokeSuper(isc.StatefulCanvas, "getScrollHeight", calcNewValue,B,C,D);

    if (this._deferredOverflow) {
        this._deferredOverflow = null;
        this.adjustOverflow("heightCheckWhileDeferred");
    }

    if (!calcNewValue && this._scrollHeight != null) return this._scrollHeight;

    // _getAutoInnerWidth() will give us back the greater of our specified size / the
    // label's visible size + our end caps.
    // This is basically our "scroll size" if overflow is visible
    var scrollHeight = this._getAutoInnerHeight()

    return (this._scrollHeight = scrollHeight);
},

// Update the label's overflow when our overflow gets updated.
setOverflow : function (newOverflow, a, b, c, d) {

    // If we're autoFit:true, and overflow is getting set to hidden revert the autoFit property
    // to false
    if (this.autoFit && this._autoFitInitialized && !this._settingAutoFit &&
        newOverflow != isc.Canvas.VISIBLE) {

        this._explicitOverflow = newOverflow;
        this.setAutoFit(false);
        return;
    }

    this.invokeSuper(isc.StatefulCanvas, "setOverflow", newOverflow, a, b, c, d);
    if (isc.isA.Canvas(this.label)) this.label.setOverflow(newOverflow, a, b, c, d);

},

// if the SIB is resized, resize the label
// This covers both:
// - the SIB is resized by application code and the label must grow/shrink
// - the SIB resizes itself as a result of the label changing size, in which case the call to
//   resize the label should no-op, since the sizes already agree
_$_resized:"_resized",
_resized : function (deltaX, deltaY, a,b,c) {
    this.invokeSuper(isc.StatefulCanvas, this._$_resized, deltaX,deltaY,a,b,c);
    //if (!this.label || this.overflow != isc.Canvas.VISIBLE) return;
    if (this.label) this.label.resizeTo(this._getLabelSpecifiedWidth(),
                                        this._getLabelSpecifiedHeight());
},


draw : function (a,b,c) {
    if (isc._traceMarkers) arguments.__this = this;


    var returnVal = isc.Canvas._instancePrototype.draw.call(this, a,b,c);
    //var returnVal = this.Super("draw", arguments);

    if (this.position != isc.Canvas.ABSOLUTE && isc.isA.Canvas(this.label)) {

        if (isc.Page.isLoaded()) this._positionLabel();
        else isc.Page.setEvent("load", this.getID() + "._positionLabel()");
    }

    if (this.label != null && isc.Canvas.ariaEnabled()) {
        //var labelDOMId = this.label.getCanvasName();
        //this.logWarn("setting labelledby to: " + labelDOMId);
        //this.setAriaState("labelledby", labelDOMId);

        var label = this.getAriaLabel();
        if (label != null) this.setAriaState("label", label);
    }

    return returnVal;
},

_positionLabel : function () {
    if (!this.isDrawn()) return;
    this.label.moveTo(this._getLabelLeft(), this._getLabelTop());
},

// setAlign() / setVAlign() to set content alignment
// JSDoc'd in subclasses
setAlign : function (align) {
    this.align = align;
    if (this.isDrawn()) this.markForRedraw();
    if (this.label) this.label.setAlign(align);
},

setVAlign : function (valign) {
    this.valign = valign;
    if (this.isDrawn()) this.markForRedraw();
    if (this.label) this.label.setVAlign(valign);
},


// Printing
// --------------------------------------------------------------------------------------

// If we are showing a label default to printing it's text rather than
// our standard content (images etc)
getPrintHTML : function (a,b,c,d) {
    var useLabel = this.shouldShowLabel();
    if (useLabel) {
        if (this.label == null) {
            this.makeLabel();
        }
        return this.label.getPrintHTML(a,b,c,d);
    }
    return this.Super("getPrintHTML", arguments);

},

// Title handling
// ---------------------------------------------------------------------------------------

//> @method statefulCanvas.shouldHiliteAccessKey()
// Should the accessKey be underlined if present in the title for this button.
// Default implementation returns +link{StatefulCanvas.hiliteAccessKey}
//<
shouldHiliteAccessKey : function () {
    return this.hiliteAccessKey;
},


// If this widget has an accessKey, it will underline the first occurance of the accessKey
// in the title (preferring Uppercase to Lowercase)
getTitleHTML : function () {

    var title = this.getTitle();

    if (!this.shouldHiliteAccessKey() || !isc.isA.String(title) || this.accessKey == null)
        return title;

    return isc.Canvas.hiliteCharacter(title, this.accessKey);
},

//>    @method    statefulCanvas.getTitle()    (A)
// Return the title - text/HTML drawn inside the component.
// <p>
// Default is to simply return this.title.
// @return    (string)    HTML for the title
// @visibility external
//<

getTitle : function () {
    return this.title;
},

//>    @method    statefulCanvas.setTitle()
// Set the title.
// @group    appearance
// @param    newTitle    (string)    new title
// @visibility external
//<
setTitle : function (newTitle) {
    // remember the contents
    this.title = newTitle;
    // re-evaluation this.getTitle in case it's dynamic.
    var newTitle = this.getTitleHTML();
    // For performance, don't force a redraw / setContents, etc if the
    // title is unchanged
    if (this._titleHTML != null && this._titleHTML == newTitle) {
        return;
    } else {
        this._titleHTML = newTitle;
    }
    if (this.label) {

        if (this.label._redrawWithMaster && this.label.masterElement == this) this.label._dirty = true;
        this.label.setContents(newTitle);
        this.label.setState(this.getState());
        this.label.setSelected(this.isSelected());
    // if we didn't have a label before, lazily create it.
    } else if (this.title != null && this.shouldShowLabel()) {
        this.makeLabel()
    }

    // Update the ariaLabel to reflect our title (we do this regardless of whether we're
    // showing a title or not.
    if (isc.Canvas.ariaEnabled()) {
        var ariaLabel = this.getAriaLabel();
        this.setAriaState("label", ariaLabel);
    }

    // redraw even if we have a title label.

    this.markForRedraw("setTitle");
},

// other Label management
// ---------------------------------------------------------------------------------------

// override setZIndex to ensure that this.label is always visible.
setZIndex : function (index,b,c) {

    isc.Canvas._instancePrototype.setZIndex.call(this, index,b,c);
    //this.Super("setZIndex", arguments);

    if (isc.isA.Canvas(this.label)) this.label.moveAbove(this);
},


// Override _updateCanFocus() update the focusability of the label too
_updateCanFocus : function () {
    this.Super("_updateCanFocus", arguments);
    if (this.label != null) this.label._updateCanFocus();
},

//> @method statefulCanvas.setIcon()
// Change the icon being shown next to the title text.
// @param icon (URL) URL of new icon
// @group buttonIcon
// @visibility external
//<
// NOTE: subclasses that show a Label use the label to show an icon.  Other subclasses (like
// Button) must override setIcon()
setIcon : function (icon) {
    this.icon = icon;
    if (this.label) this.label.setIcon(icon);
    // lazily create a label if necessary
    else if (icon && this.shouldShowLabel()) this.makeLabel();
},

// Mouse Event Handlers
// --------------------------------------------------------------------------------------------
// various mouse events will set the state of this object.

// implement mouseOver / mouseOut handlers to apply appropriate states to
// this widget.

handleMouseOver : function (event,eventInfo) {
    var rv;
    if (this.mouseOver != null) {
        rv = this.mouseOver(event, eventInfo);
        if (rv == false) return false;
    }

    if (this.showDown && this.ns.EH.mouseIsDown()) {
        // XXX we should only show down if the mouse went down on us originally
        this.setState(isc.StatefulCanvas.STATE_DOWN);
    } else {
        if (this.showRollOver) {
            this.setState(isc.StatefulCanvas.STATE_OVER);
        }
        if (this.showOverCanvas) {
            if (!this.overCanvas) {
                this.addAutoChild("overCanvas", {
                    autoDraw:false
                })
            }
            if (!this.overCanvas.isDrawn()) this.overCanvas.draw();
        }
    }
    return rv;
},

// clear rollOver styling on mouseOut
handleMouseOut : function (event,eventInfo) {
    var rv;
    if (this.mouseOut != null) {
        rv = this.mouseOut(event, eventInfo);
        if (rv == false) return rv;
    }

    if (this.showRollOver) {
        this.setState(isc.StatefulCanvas.STATE_UP);
    } else if (this.showDown && this.ns.EH.mouseIsDown()) {
        // FIXME we should only pop up if the mouse went down on us originally
        this.setState(isc.StatefulCanvas.STATE_UP);
    }

    if (this.showOverCanvas && this.overCanvas && this.overCanvas.isVisible() &&
        (isc.EH.getTarget() != this.overCanvas))
    {
        this.overCanvas.clear();
    }
    return rv;
},

// override the internal _focusChanged() method to set the state of the canvas to "over" on
// focus.  (Note - overriding this rather than the public 'focusChanged()' method so developers
// can still put functionality into that method without worrying about calling 'super').
_focusChanged : function (hasFocus,b,c,d) {

    var returnVal = this.invokeSuper(isc.StatefulCanvas, "_focusChanged", hasFocus,b,c,d);
    // don't show the over state if we don't actually have focus anymore (because onFocus
    // is delayed in IE and focus may be elsewhere by the time it fires)
    if (!(hasFocus && isc.Browser.isIE &&
         (this.getFocusHandle() != this.getDocument().activeElement)) )
    {
        this.updateStateForFocus(hasFocus);
    }

    return returnVal;
},

updateStateForFocus : function (hasFocus) {

    if (!this.showFocused) return;

    if (this.showFocusedAsOver) {
        // NOTE: don't show the over state if showRollOver is false, because this is typically set
        // because there is no over state media (eg for an ImgButton)
        if (!this.showRollOver) return;

        var state = this.getState();
        if (hasFocus && !this.isDisabled()) {
            // on focus, if our state is currently 'up' set state to 'over' to indicate
            // we have focus
            if (state == isc.StatefulCanvas.STATE_UP) this.setState(isc.StatefulCanvas.STATE_OVER);
        } else {
            // on blur - clear out the 'over' state (if appropriate)
            if (state == isc.StatefulCanvas.STATE_OVER) this.setState(isc.StatefulCanvas.STATE_UP);
        }
    } else {
        // just call stateChanged - it will check this.hasFocus
        this.stateChanged();
        // Note: normally label styling etc will be updated by stateChanged() - but in this case
        // the other states are all unchanged so the label would not necessarily refresh to reflect
        // the focused state.
        if (this.label) this.label.stateChanged();
    }
},


// getFocusedState() - returns a boolean value for whether we should show the "Focused" state
getFocusedState : function () {
    if (!this.showFocused || this.showFocusedAsOver || this.isDisabled()) return false;
    return this.hasFocus;
},

//>    @method    statefulCanvas.handleMouseDown()    (A)
// MouseDown event handler -- show the button as down if appropriate
// calls this.mouseDown() if assigned
//    may redraw the button
//        @group    event
//<
handleMouseDown : function (event, eventInfo) {
    if (event.target == this && this.useEventParts) {
        if (this.firePartEvent(event, isc.EH.MOUSE_DOWN) == false) return false;
    }
    var rv;
    if (this.mouseDown) {
        rv = this.mouseDown(event, eventInfo);
        if (rv == false) return false;
    }
    if (this.showDown) this.setState(isc.StatefulCanvas.STATE_DOWN);
    return rv;
},


//>    @method    statefulCanvas.handleMouseUp()    (A)
//        @group    event
//            mouseUp event handler -- if showing the button as down, reset to the 'up' state
//          calls this.mouseUp() if assigned
//<
handleMouseUp : function (event, eventInfo) {
    if (event.target == this && this.useEventParts) {
        if (this.firePartEvent(event, isc.EH.MOUSE_UP) == false) return false;
    }

    var rv;
    if (this.mouseUp) {
        rv = this.mouseUp(event, eventInfo);
        if (rv == false) return false;
    }

    // set the state of the button to change it's appearance
    if (this.showDown) {
        this.setState(this.showRollOver ? isc.StatefulCanvas.STATE_OVER :
                      isc.StatefulCanvas.STATE_UP);
    }
    return rv;
},





//>    @method    statefulCanvas.handleActivate() (A)
//      "Activate" this widget - fired from click or Space / Enter keypress.
//      Sets selection state of this widget if appropriate.
//      Calls this.activate stringMethod if defined
//      Otherwise calls this.click stringMethod if defined.
//      @group  event
//<
handleActivate : function (event, eventInfo) {
    var actionType = this.getActionType();
    if (actionType == isc.StatefulCanvas.RADIO) {
        // if a radio button, select this button
        this.select();

    } else if (actionType == isc.StatefulCanvas.CHECKBOX) {
        // if a checkbox, toggle the selected state
        this.setSelected(!this.isSelected());
    }

    if (this.activate) return this.activate(event, eventInfo);

    if (this.action) return this.action();
    if (this.click) return this.click(event, eventInfo);
},


//>    @method    statefulCanvas.handleClick()    (A)
//            click event handler -- falls through to handleActivate.
//          Note: Does not call 'this.click' directly - this is handled by handleActivate
//        @group    event
//<
handleClick : function (event, eventInfo) {
    if (isc._traceMarkers) arguments.__this = this;

    // This is required to handle icon clicks on buttons, etc
    if (event.target == this && this.useEventParts) {
        if (this.firePartEvent(event, isc.EH.CLICK) == false) return false;
    }
    return this.handleActivate(event,eventInfo);
},

//>    @method    statefulCanvas.handleKeyPress()    (A)
//            keyPress event handler.
//          Will call this.keyPress if defined on Space or Enter keypress, falls through
//          to this.handleActivate().
//        @group    event
//<
handleKeyPress : function (event, eventInfo) {
    if (isc._traceMarkers) arguments.__this = this;

    if (this.keyPress && (this.keyPress(event, eventInfo) == false)) return false;

    if (event.keyName == "Space" || event.keyName == "Enter") {
        if (this.handleActivate(event, eventInfo) == false) return false;
    }

    return true;

},

// ---------------------------------------------------------------------------------------

// override destroy to removeFromRadioGroup - cleans up a class level pointer to this widget.
destroy : function () {
    this.removeFromRadioGroup();

    return this.Super("destroy", arguments);
}



});

// Add 'activate' as a stringMethod to statefulCanvii, with the same signature as 'click'
isc.StatefulCanvas.registerStringMethods({
    activate:isc.EH._eventHandlerArgString,  //"event, eventInfo"

    //> @method statefulCanvas.action()
    // This property contains the default 'action' for the Button to fire when activated.
    //<
    // exposed on the Button / ImgButton / StretchImgButton subclasses
    action:""
});

isc.StatefulCanvas.addClassMethods({

// build a properties object representing the border for supplied CSS class name
_buildBorderStyle : function (borderRadiusOnly, className) {

    // for performance, use cached border style results if present
    var classNameKey = borderRadiusOnly ? "$" + className : className;

    if (this._borderStyleCache[classNameKey]) {
        return this._borderStyleCache[classNameKey];
    }

    // if no cached results are present, we must recompute

    var maxProperties,
        borderStyle = {},
        setProperties = 0;

    // if widget has border specified, we need only propagate border radius
    maxProperties = borderRadiusOnly ? isc.StatefulCanvas._nRadiusBorderProperties :
                                       isc.StatefulCanvas._borderProperties.length;

    var styleInfo = isc.Element.getStyleDeclaration(className, true);
    if (styleInfo) {
        for (var i = 0; i < styleInfo.length; i++) {
            for(var j = 0; j < maxProperties; j++) {
                var prop = isc.StatefulCanvas._borderProperties[j];
                if (borderStyle[prop] == null && styleInfo[i][prop] != isc.emptyString) {
                    borderStyle[prop] = styleInfo[i][prop];
                    setProperties++;
                }
            }
            if (setProperties == maxProperties) break;
        }
    }
    this._borderStyleCache[classNameKey] = borderStyle;
    return borderStyle;
},

// build an HTML string representing the border for supplied CSS class name
_getBorderCSSHTML : function (borderRadiusOnly, className) {

    // for performance, use cached border CSS HTML results if present
    var classNameKey = borderRadiusOnly ? "$" + className : className;

    if (this._borderCSSHTMLCache[classNameKey]) {
        return this._borderCSSHTMLCache[classNameKey];
    }

    // if no cached results are present, we must recompute
    var borderStyle = this._buildBorderStyle(borderRadiusOnly, className);

    var cssText = isc.emptyString,
        separator = isc.StatefulCanvas._$separator;

    // build border style for each possibly different edge

    var bottom = isc.SB.concat(
        borderStyle.borderBottomWidth, separator,
        borderStyle.borderBottomStyle, separator,
        borderStyle.borderBottomColor).trim();

    var left = isc.SB.concat(
        borderStyle.borderLeftWidth, separator,
        borderStyle.borderLeftStyle, separator,
        borderStyle.borderLeftColor).trim();

    var right = isc.SB.concat(
        borderStyle.borderRightWidth, separator,
        borderStyle.borderRightStyle, separator,
        borderStyle.borderRightColor).trim();

    var top = isc.SB.concat(
        borderStyle.borderTopWidth, separator,
        borderStyle.borderTopStyle, separator,
        borderStyle.borderTopColor).trim();

    // apply border styles separately if necessary, otherwise as simple border
    if (bottom != left || bottom != right || bottom != top) {
        if (bottom != isc.emptyString) cssText += isc.semi + "BORDER-BOTTOM:" + bottom;
        if (left   != isc.emptyString) cssText += isc.semi + "BORDER-LEFT:"   + left;
        if (right  != isc.emptyString) cssText += isc.semi + "BORDER-RIGHT:"  + right;
        if (top    != isc.emptyString) cssText += isc.semi + "BORDER-TOP:"    + top;
    } else {
        if (bottom != isc.emptyString) cssText += isc.semi + "BORDER:" + bottom;
    }

    var bl = borderStyle.borderBottomLeftRadius,
        br = borderStyle.borderBottomRightRadius,
        tr = borderStyle.borderTopRightRadius,
        tl = borderStyle.borderTopLeftRadius;

    // apply border radius separately if necessary, otherwise as simple border radius
    if (bl != br || bl != tr || bl != tl) {
        if (bl != null) cssText += isc.semi + "BORDER-BOTTOM-LEFT-RADIUS:"  + bl;
        if (br != null) cssText += isc.semi + "BORDER-BOTTOM-RIGHT-RADIUS:" + br;
        if (tr != null) cssText += isc.semi + "BORDER-TOP-RIGHT-RADIUS:"    + tr;
        if (tl != null) cssText += isc.semi + "BORDER-TOP-LEFT-RADIUS:"     + tl;
    } else {
        if (bl != null) cssText += isc.semi + "BORDER-RADIUS:" + bl;
    }

    this._borderCSSHTMLCache[classNameKey] = cssText;
    return cssText;
},

// clear the cache of per-class name CSS border objects and HTML strings
clearBorderCSSCache : function () {
    if (isc.StatefulCanvas.pushTableBorderStyleToDiv) {
        this._borderStyleCache   = {};
        this._borderCSSHTMLCache = {};
    }
}

});







//>    @class    Layout
//
// A subclass of Canvas that automatically arranges other Canvases according to a layout policy.
// <br><br>
// A Layout manages a set of "member" Canvases initialized via the "members" property.  Layouts
// can have both "members", which are managed by the Layout, and normal Canvas children, which
// are unmanaged.
// <br><br>
// Rather than using the Layout class directly, use the HLayout, VLayout, HStack and VStack
// classes, which are subclasses of Layout preconfigured for horizontal or vertical stacking,
// with the "fill" (VLayout) or "none" (VStack) +link{type:LayoutPolicy,policies} already set.
// <br><br>
// Layouts and Stacks may be nested to create arbitrarily complex layouts.
// <br><br>
// To show a resizer bar after (to the right or bottom of) a layout member, set showResizeBar to
// true on that member component (not on the HLayout or VLayout).  Resizer bars override
// membersMargin spacing.
// <br><br>
// Like other Canvas subclasses, Layout and Stack components may have % width and height
// values. To create a dynamically-resizing layout that occupies the entire page (or entire
// parent component), set width and height to "100%".
//
// @see type:LayoutPolicy for available policies
// @see class:VLayout
// @see class:HLayout
// @see class:VStack
// @see class:HStack
// @see class:LayoutSpacer
// @treeLocation Client Reference/Layout
// @visibility external
//<

isc.ClassFactory.defineClass("Layout","Canvas");


isc.Layout.addClassProperties({
    //>    @type    Orientation
    //            @group    orientation
    // @visibility external
    //    @value    isc.Layout.VERTICAL members laid out vertically
    //    @value    isc.Layout.HORIZONTAL members laid out horizontally
    //<
    //VERTICAL:"vertical", // NOTE: constant declared by Canvas
    //HORIZONTAL:"horizontal", // NOTE: constant declared by Canvas

    //> @type LayoutPolicy
    //  Policy controlling how the Layout will manage member sizes on this axis.
    //  <P>
    //  See also +link{layout.overflow}.
    //
    //  @value  Layout.NONE
    //  Layout does not try to size members on the axis at all, merely stacking them (length
    //  axis) and leaving them at default breadth.
    //
    //  @value  Layout.FILL
    //  Layout sizes members so that they fill the specified size of the layout.  The rules
    //  are:
    //  <ul>
    //  <li> Any component given an initial pixel size, programmatically resized to a specific
    //  pixel size, or drag resized by user action is left at that exact size
    //  <li> Any component that +link{button.autoFit,autofits} is given exactly the space it
    //  needs, never forced to take up more.
    //  <li> All other components split the remaining space equally, or according to their
    //  relative percentages.
    //  </ul>
    //
    // @visibility external
    FILL:"fill"
    //<
    //NONE:"none", // NOTE: constant declared by Canvas
});

isc.Layout.addProperties({
    //> @attr layout.members    (Array of Canvas : null : [IRW])
    // An array of canvases that will be contained within this layout. You can set the
    // following properties on these canvases (in addition to the standard component
    // properties):
    // <ul>
    //  <li>layoutAlign--specifies the member's alignment along the breadth axis; valid
    //  values are "top", "center" and "bottom" for a horizontal layout and "left", "center"
    //  and "right" for a vertical layout (see +link{layout.defaultLayoutAlign} for default
    //  implementation.)
    //  <li>showResizeBar--set to true to show a resize bar (default is false)
    // </ul>
    // Height and width settings found on members are interpreted by the Layout according to
    // the +link{layout.vPolicy,layout policy}.
    // @visibility external
    //<

    // Policy
    // ---------------------------------------------------------------------------------------

    //> @attr layout.overflow   (Overflow : "visible" : IR)
    // Normal +link{type:Overflow} settings can be used on layouts, for example, an
    // overflow:auto Layout will scroll if members exceed its specified size, whereas an
    // overflow:visible Layout will grow to accommodate members.
    //
    // @group layoutPolicy
    // @visibility external
    //<

    //> @attr layout.orientation    (Orientation : "horizontal" : AIRW)
    // Orientation of this layout.
    // @group layoutPolicy
    // @visibility external
    // @deprecated in favor of +link{layout.vertical,this.vertical}, which, if specified takes
    //  precedence over this setting
    //<
    orientation:"horizontal",

    //> @attr layout.vertical (boolean : null : IRW)
    // Should this layout appear with members stacked vertically or horizontally. Defaults to
    // <code>false</code> if unspecified.
    // @group layoutPolicy
    // @visibility external
    //<
    // Not specified by default as this would change behavior of subclasses that make use of
    // the orientation setting instead.
    // Actually 'defaults to false if unspecified' isn't quite true -- it defaults to the
    // orientation setting but that's deprecated.

    //> @attr layout.vPolicy    (LayoutPolicy : "fill" : IRWA)
    // Sizing policy applied to members on vertical axis
    // @group layoutPolicy
    // @visibility external
    //<
    vPolicy:isc.Layout.FILL,

    //> @attr layout.hPolicy    (LayoutPolicy : "fill" : IRWA)
    // Sizing policy applied to members on horizontal axis
    // @group layoutPolicy
    // @visibility external
    //<
    hPolicy:isc.Layout.FILL,

    //> @attr layout.minMemberSize (int : 1 : IR)
    // Minimum size, in pixels, below which flexible-sized members should never be shrunk, even
    // if this requires the Layout to overflow.
    // <p>
    // Does not apply to members given a fixed size in pixels - such members will never be
    // shrunk below their specified size in general.
    //
    // @group layoutPolicy
    // @visibility external
    //<
    minMemberSize:1,

    //> @attr layout.enforcePolicy (Boolean : true : IRWA)
    // Whether the layout policy is continuously enforced as new members are added or removed
    // and as members are resized.
    // <p>
    // This setting implies that any member that resizes larger, or any added member, will take
    // space from other members in order to allow the overall layout to stay the same size.
    // @group layoutPolicy
    // @visibility external
    //<
    enforcePolicy:true,

    //> @attr layout.defaultLayoutAlign (Alignment or VerticalAlignment : null : IR)
    // Specifies the default alignment for layout members on the breadth axis (horizontal axis
    // for a VLayout, vertical axis for an HLayout).  Can be overridden on a per-member basis
    // by setting +link{canvas.layoutAlign}.
    // <P>
    // If unset, default member layout alignment will be "top" for a horizontal layout, and
    // "left" for a vertical layout, or "right" if in +link{Page.isRTL(),RTL} mode.
    // <P>
    // When attempting to center components be sure that you have set a specific size on the
    // component(s) involved.  If components fill all available space in the layout, centering
    // looks the same as not centering.
    // <P>
    // Similarly, if a component has no visible boundary (like a border), it can appear similar
    // to when it's not centered if the component is larger than you expect - use the Watch tab
    // in the Developer Console to see the component's extents visually.
    //
    // @group layoutMember
    // @group layoutPolicy
    // @visibility external
    // @example layoutCenterAlign
    //<

    //> @attr layout.align (Alignment or VerticalAlignment : null : IRW)
    // Alignment of all members in this Layout on the length axis (vertical for a VLayout,
    // horizontal for an HLayout).  Defaults to "top" for vertical Layouts, and "left" for
    // horizontal Layouts.
    // <P>
    // For alignment on the breadth axis, see +link{defaultLayoutAlign} and
    // +link{canvas.layoutAlign}.
    // <P>
    // When attempting to center components be sure that you have set a specific size on the
    // component(s) involved.  If components fill all available space in the layout, centering
    // looks the same as not centering.
    // <P>
    // Similarly, if a component has no visible boundary (like a border), it can appear similar
    // to when it's not centered if the component is larger than you expect - use the Watch tab
    // in the Developer Console to see the component's extents visually.
    //
    // @group layoutPolicy
    // @visibility external
        // @example layoutCenterAlign
    //<
    //align:null,
    // NB: you can achieve the same effect with a LayoutSpacer in the first slot, but that
    // throws off member numbering

    //> @attr layout.reverseOrder   (Boolean : false : IRW)
    // Reverse the order of stacking for this Layout, so that the last member is shown first.
    // <P>
    // Requires a manual call to <code>reflow()</code> if changed on the fly.
    // <P>
    // In RTL mode, for horizontal Layouts the value of this flag will be flipped during
    // initialization.
    // @group layoutPolicy
    // @visibility external
    //<

    // Margins and Spacing
    // ---------------------------------------------------------------------------------------

    //> @attr layout.paddingAsLayoutMargin (Boolean : true : IRWA)
    // If this widget has padding specified (as +link{canvas.padding, this.padding} or in the
    // CSS style applied to this layout), should it show up as space outside the members,
    // similar to layoutMargin?
    // <P>
    // If this setting is false, padding will not affect member positioning (as CSS padding
    // normally does not affect absolutely positioned children).  Leaving this setting true
    // allows a designer to more effectively control layout purely from CSS.
    // <P>
    // Note that +link{layout.layoutMargin} if specified, takes precedence over this value.
    // @group layoutMargin
    // @visibility external
    //<
    paddingAsLayoutMargin:true,


    _suppressOuterDivPadding:true,

    //> @attr layout.layoutMargin (integer : null : [IRW])
    // Space outside of all members. This attribute, along with +link{layout.layoutLeftMargin}
    // and related properties does not have a true setter method.<br>
    // It may be assigned directly at runtime. After setting the property,
    // +link{layout.setLayoutMargin()} may be called with no arguments to reflow the layout.
    // @see layoutLeftMargin
    // @see layoutRightMargin
    // @see layoutBottomMargin
    // @see layoutTopMargin
    // @see paddingAsLayoutMargin
    // @setter none (see +link{layout.setLayoutMargin()})
    // @group layoutMargin
    // @visibility external
    // @example userSizing
    //<
//    layoutMargin:null,

    //> @attr layout.layoutLeftMargin (integer : null : [IRW])
    // Space outside of all members, on the left-hand side.  Defaults to +link{layoutMargin}.
    // <P>
    // Requires a manual call to <code>setLayoutMargin()</code> if changed on the fly.
    // @group layoutMargin
    // @visibility external
    //<

    //> @attr layout.layoutRightMargin (integer : null : [IRW])
    // Space outside of all members, on the right-hand side.  Defaults to +link{layoutMargin}.
    // <P>
    // Requires a manual call to <code>setLayoutMargin()</code> if changed on the fly.
    // @group layoutMargin
    // @visibility external
    //<

    //> @attr layout.layoutTopMargin (integer : null : [IRW])
    // Space outside of all members, on the top side.  Defaults to +link{layoutMargin}.
    // <P>
    // Requires a manual call to <code>setLayoutMargin()</code> if changed on the fly.
    // @group layoutMargin
    // @visibility external
    //<

    //> @attr layout.layoutBottomMargin (integer : null : [IRW])
    // Space outside of all members, on the bottom side.  Defaults to +link{layoutMargin}.
    // <P>
    // Requires a manual call to <code>setLayoutMargin()</code> if changed on the fly.
    // @group layoutMargin
    // @visibility external
    //<

    //> @attr layout.membersMargin (int : 0 : [IRW])
    // Space between each member of the layout.
    // <P>
    // Requires a manual call to <code>reflow()</code> if changed on the fly.
    // @group layoutMargin
    // @visibility external
    // @example userSizing
    //<
    membersMargin:0,

    //> @attr layout.leaveScrollbarGap (Boolean : false : IR)
    // Whether to leave a gap for a vertical scrollbar even when one is not actually present.
    // <P>
    // This setting avoids the layout resizing all members when the vertical scrollbar is
    // introduced or removed, which can avoid unnecessary screen shifting and improve
    // performance.
    //
    // @visibility external
    //<

    //> @attr layout.memberOverlap (positiveInteger : 0 : IR)
    // Number of pixels by which each member should overlap the preceding member, used for
    // creating an "stack of cards" appearance for the members of a Layout.
    // <P>
    // <code>memberOverlap</code> can be used in conjunction with +link{stackZIndex} to create
    // a particular visual stacking order.
    // <P>
    // Note that overlap of individual members can be accomplished with a negative setting for
    // +link{canvas.extraSpace}.
    //
    // @group layoutMember
    // @visibility external
    //<

    // ResizeBars
    // ---------------------------------------------------------------------------------------

    //> @type LayoutResizeBarPolicy
    // Policy for whether resize bars are shown on members by default.
    //
    // @value "marked" resize bars are only shown on members marked
    //                 +link{canvas.showResizeBar,showResizeBar:true}
    // @value "middle" resize bars are shown on all resizable members that are not explicitly marked
    //              showResizeBar:false, except the last member.  Appropriate for a
    //              +link{LayoutPolicy} of "fill" (VLayout, HLayout) since the overall space will
    //              always be filled.
    // @value "all" resize bars are shown on all resizable members that are not explicitly marked
    //              showResizeBar:false, including the last member.  Can be appropriate for a
    //              +link{LayoutPolicy} of "none" (VStack, HStack) since the overall size of the
    //              layout is dictated by it's member's sizes.
    // @value "none" resize bars are not shown even if members are marked with
    //                 +link{canvas.showResizeBar,showResizeBar:true}
    //
    // @visibility external
    //<

    //> @attr layout.defaultResizeBars (LayoutResizeBarPolicy : "marked" : IRW)
    // Policy for whether resize bars are shown on members by default. Note that this setting
    // changes the effect of +link{canvas.showResizeBar} for members of this layout.
    //
    // @see canvas.showResizeBar
    // @visibility external
    //<
    defaultResizeBars: "marked",

    setDefaultResizeBars : function (resizeBars) {
        if (this.defaultResizeBars == resizeBars) return;
        this.defaultResizeBars = resizeBars;
        this._computeShowResizeBarsForMembers();
    },

    //> @attr layout.resizeBarClass (String : "Splitbar" : AIRW)
    // Class to use for creating resizeBars.
    // <P>
    // A resize bar will be created for any Layout member that specifies
    // +link{canvas.showResizeBar,<code>showResizeBar:true</code>}.
    // Resize bars will be instances of the class specified by this property, and will
    // automatically be sized to the member's breadth and to the thickness
    // given by +link{layout.resizeBarSize}.<br>
    // Classes that are valid by default are +link{Splitbar} and +link{ImgSplitbar}.
    // <P>
    // To customize the appearance or behavior of resizeBars within some layout a custom
    // resize bar class can be created by subclassing +link{Splitbar} or +link{ImgSplitbar} and
    // setting this property on your layout to use your new class.
    // <P>
    // Resize bars will automatically be sized to the member's breadth and to the thickness
    // given by <code>layout.resizeBarSize</code>.  The built-in Splitbar class supports
    // drag resizing of its target member, and clicking on the bar to hide the target member.
    //
    // @see class:Splitbar
    // @see class:ImgSplitbar
    // @see attr:layout.resizeBarSize
    // @visibility external
    //<

    resizeBarClass:"Splitbar",


    //> @attr layout.resizeBarSize (int : 7 : AIRW)
    // Thickness of the resizeBars in pixels
    // @visibility external
    //<
    resizeBarSize:7,

    //>Animation
    // ---------------------------------------------------------------------------------------

    //> @attr layout.animateMembers (boolean : null : IRW)
    // If true when members are added / removed, they should be animated as they are shown
    // or hidden in position
    // @group animation
    // @visibility animation
    // @example animateLayout
    //<

    //> @attr layout.animateMemberEffect (string : "slide" : IRW)
    // Animation effect for hiding and showing members when animateMembers is true.
    // @group animation
    // @visibility internal
    //<

    animateMemberEffect:"slide",

    //> @attr layout.animateMemberTime (number : null : IRWA)
    // If specified this is the duration of show/hide animations when members are being shown
    // or hidden due to being added / removed from this layout.
    // @group animation
    // @visibility animation
    //<

    //> @attr layout.suppressMemberAnimations (boolean : null : IRWA)
    // If true, when a member starts to perform an animated resize, instantly finish the
    // animation rather than reflowing the Layout on each step of the animation.
    // @group animation
    //<

    //<Animation

    // Drag and Drop
    // ---------------------------------------------------------------------------------------

    //> @attr layout.canDropComponents (Boolean : true : IRA)
    // Layouts provide a default implementation of a drag and drop interaction.  If you set
    // +link{Canvas.canAcceptDrop,canAcceptDrop}:true and <code>canDropComponents:true</code>
    // on a Layout, when a droppable Canvas (+link{canvas.canDrop,canDrop:true} is dragged over
    // the layout, it will show a dropLine (a simple insertion line) at the drop location.
    // <P>
    // When the drop occurs, the dragTarget (obtained using
    // +link{EventHandler.getDragTarget()}) is added as a member of this layout at the location
    // shown by the dropLine (calculated by +link{Layout.getDropPosition()}).  This default
    // behavior allows either members or external components that have
    // +link{Canvas.canDragReposition} (or +link{Canvas.canDrag}) and +link{Canvas.canDrop} set
    // to <code>true</code> to be added to or reordered within the Layout.
    // <P>
    // You can control the thickness of the dropLine via +link{Layout.dropLineThickness} and
    // you can customize the style using css styling in the skin file (look for .layoutDropLine
    // in skin_styles.css for your skin).
    // <P>
    // If you want to dynamically create a component to be added to the Layout in response to a
    // drop event you can do so as follows:
    // <pre>
    // isc.VLayout.create({
    //   ...various layout properties...
    //   canDropComponents: true,
    //   drop : function () {
    //     // create the new component
    //     var newMember = isc.Canvas.create();
    //     // add to the layout at the current drop position
    //     // (the dropLine will be showing here)
    //     this.addMember(newMember, this.getDropPosition());
    //     // hide the dropLine that was automatically shown
    //     // by builtin SmartClient methods
    //     this.hideDropLine();
    //   }
    // });
    // </pre>
    // If you want to completely suppress the builtin drag and drop logic, but still receive drag
    // and drop events for your own custom implementation, set +link{Canvas.canAcceptDrop} to
    // <code>true</code> and <code>canDropComponents</code> to <code>false</code> on your Layout.
    //
    // @group dragdrop
    // @visibility external
    //<
    canDropComponents: true,

    //> @attr layout.dropLineThickness (number : 2 : IRA)
    //
    // Thickness, in pixels of the dropLine shown during drag and drop when
    // +link{Layout.canDropComponents} is set to <code>true</code>.  See the discussion in
    // +link{Layout} for more info.
    //
    // @see Layout
    // @group dragdrop
    // @visibility external
    // @example dragMove
    //<
    dropLineThickness : 2,

    //> @attr layout.showDropLines (boolean : null : IRW)
    // Controls whether to show a drop-indicator during a drag and drop operation.  Set to
    // false if you either don't want to show drop-lines, or plan to create your own.
    //
    // @group dragdrop
    // @visibility external
    //<
    //showDropLines : true,

    //> @attr layout.showDragPlaceHolder (boolean : null : IRW)
    // If set to true, when a member is dragged out of layout, a visible placeholder canvas
    // will be displayed in place of the dragged widget for the duration of the drag and drop
    // interaction.
    // @group dragdrop
    // @visibility external
    // @example dragMove
    //<

    //> @attr layout.placeHolderProperties (canvas properties: null : IR)
    // If +link{layout.showDragPlaceHolder, this.showDragPlaceHolder} is true, this
    // properties object can be used to customize the appearance of the placeholder displayed
    // when the user drags a widget out of this layout.
    // @group dragdrop
    // @visibility external
    // @example dragMove
    //<

    membersAreChildren:true

    //> @attr layout.stackZIndex (string: null : IR)
    // For use in conjunction with +link{memberOverlap}, controls the z-stacking order of
    // members.
    // <P>
    // If "lastOnTop", members stack from the first member at bottom to the last member at
    // top. If "firstOnTop", members stack from the last member at bottom to the first member
    // at top.
    //
    // @visibility external
    //<
});

//> @groupDef layoutMember
// Properties that can be set on members of a layout to control how the layout is done
// @visibility external
//<

//> @attr canvas.layoutAlign (Alignment or VerticalAlignment : null : IR)
// When this Canvas is included as a member in a Layout, layoutAlign controls alignment on the
// breadth axis of the layout.  Default is "left" for a VLayout, "top" for an HLayout.
// @group layoutMember
// @visibility external
// @example layoutCenterAlign
//<

//> @attr canvas.showResizeBar (Boolean : false : IRW)
// When this Canvas is included as a member in a +link{Layout}, whether a resizeBar should be shown
// after this member in the layout, to allow it to be resized.
// <p>
// Whether a resizeBar is actually shown also depends on the
// +link{layout.defaultResizeBars,defaultResizeBars} attribute of the layout, and whether this
// Canvas is the last layout member.
// <p>
// By default the resize bar acts on the Canvas that it is declared on.  If you want the resize
// bar to instead act on the next member of the Layout (e.g. to collapse down or to the right),
// set +link{canvas.resizeBarTarget} as well.
//
// @group layoutMember
// @see canvas.resizeBarTarget
// @see layout.defaultResizeBars
// @visibility external
// @example layoutNesting
//<

//> @attr canvas.resizeBarTarget (String : null : IR)
// When this Canvas is included as a member in a Layout, and +link{showResizeBar} is set to
// <code>true</code> so that a resizeBar is created, <code>resizeBarTarget:"next"</code> can be
// set to indicate that the resizeBar should resize the next member of the layout rather than
// this one.  For resizeBars that support hiding their target member when clicked on,
// <code>resizeBarTarget:"next"</code> also means that the next member will be the one hidden.
// <P>
// This is typically used to create a 3-way split pane, where left and right-hand sections can
// be resized or hidden to allow a center section to expand.
// <P>
// <b>NOTE:</b> as with any Layout, to ensure all available space is used, one or more members
// must maintain a flexible size (eg 75%, or *).  In a two pane Layout with a normal resize
// bar, to fill all space after a user resizes, the member on the <b>right</b> should have
// flexible size.  With resizeBarTarget:"next", the member on the <b>left</b> should have
// flexible size.
//
// @group layoutMember
// @see canvas.showResizeBar
// @visibility external
//<

//> @attr canvas.extraSpace (positiveInteger : 0 : IR)
// When this Canvas is included as a member in a Layout, extra blank space that should be left
// after this member in a Layout.
// @see class:LayoutSpacer for more control
// @group layoutMember
// @visibility external
//<

isc.Canvas.addMethods({
    //> @method canvas.setShowResizeBar()
    // When this Canvas is included as a member in a +link{Layout}, dynamically updates whether a
    // resizeBar should be shown after this member in the layout, to allow it to be resized.
    // <p>
    // Whether a resizeBar is actually shown also depends on the
    // +link{layout.defaultResizeBars,defaultResizeBars} attribute of the layout, and whether this
    // Canvas is the last layout member.
    // @param show (boolean) setting for this.showResizeBar
    // @group layoutMember
    // @see layout.defaultResizeBars
    // @visibility external
    //<
    setShowResizeBar : function (show) {
        if (this.showResizeBar == show) return;
        this.showResizeBar = show;

        var layout = this.parentElement;
        if (layout == null || !isc.isA.Layout(layout)) return;
        layout._computeShowResizeBarsForMembers();
    }
});


// Length/Breadth sizing functions
// --------------------------------------------------------------------------------------------
// NOTE:
// To generalize layouts to either dimension we use the following terms:
//
// - length: size along the axis on which the layout stacks the members (the "length axis")
// - breadth: size on the other axis (the "breadth axis")

isc.Layout.addMethods({

getMemberLength : function (member) {
    return this.vertical ? member.getVisibleHeight() : member.getVisibleWidth()
},

//> @method layout.getMemberOffset() [A]
// Override point for changing the offset on the breadth axis for members, that is, the offset
// relative to the left edge for a vertical layout, or the offset relative to the top edge for
// a horizontal layout.
// <P>
// The method is passed the default offset that would be used for the member if
// getMemberOffset() were not implemented.  This default offset already takes into account
// +link{layoutMargin}, as well as the +link{defaultLayoutAlign,alignment on the breadth axis},
// which is also passed to getMemberOffset().
// <P>
// This method is an override point only; it does not exist by default and cannot be called.
//
// @param member (Canvas) Component to be positioned
// @param defaultOffset (Number) Value of the currently calculated member offset.  If this
//      value is returned unchanged the layout will have its default behavior
// @param alignment (String) alignment of the enclosing layout, on the breadth axis
// @group layoutMember
// @visibility external
//<

getMemberBreadth : function (member) {
    return this.vertical ? member.getVisibleWidth() : member.getVisibleHeight()
},

setMemberBreadth : function (member, breadth) {
    if (this.logIsDebugEnabled(this._$layout)) this._reportResize(member, breadth);
    this.vertical ? member.setWidth(breadth) : member.setHeight(breadth);
},

// NOTE: these return the space available to lay out components, not the specified size
getLength : function () {
    if (this.vertical) return this.getInnerHeight();
    var width = this.getInnerWidth();
    if (this.leaveScrollbarGap && !this.vscrollOn) width -= this.getScrollbarSize();
    return width;
},
getBreadth : function () {
    if (!this.vertical) return this.getInnerHeight();
    var width = this.getInnerWidth();
    if (this.leaveScrollbarGap && !this.vscrollOn) width -= this.getScrollbarSize();
    return width;
},

getLengthPolicy : function () {
    return this.vertical ? this.vPolicy : this.hPolicy;
},

getBreadthPolicy : function () {
    return this.vertical ? this.hPolicy : this.vPolicy;
},


memberHasInherentLength : function (member) {
    if (!(this.vertical ? member.hasInherentHeight() : member.hasInherentWidth())) {
        return false;
    }
    // if a percent size or "*" is set on a member that supposedly has inherent length, take
    // this as a sign that the member should actually be sized normally.  Note that if we allow
    // a percent-size member to size itself, a stack of such members would not perfectly fill
    // space, because they can't coordinate on rounding to the nearest pixel!
    var explicitLength = this._explicitLength(member);
    if (isc.isA.String(explicitLength) &&
        (explicitLength.endsWith(this._$percent) || explicitLength == this._$star))
    {
        return false;
    }
    return true;
},

memberHasInherentBreadth : function (member) {
    return (this.vertical ? member.hasInherentWidth() : member.hasInherentHeight());
},

_overflowsLength : function (member) {
    return ((this.vertical && member.canOverflowHeight()) ||
            (!this.vertical && member.canOverflowWidth()));
},

// NOTE: specified width/height will be defined if width/height were set on construction.
_explicitLength : function (member) {
    return this.vertical ? member._userHeight : member._userWidth;
},

_explicitBreadth : function (member) {
    return this.vertical ? member._userWidth : member._userHeight;
},

_memberPercentLength : function (member) {
    return this.vertical ? member._percent_height : member._percent_width;
},

scrollingOnLength : function () { return this.vertical ? this.vscrollOn : this.hscrollOn },

getMemberGap : function (member) {
    return (member.extraSpace  || 0)  - (this.memberOverlap || 0)
        + (member._internalExtraSpace || 0);
},





// Creation/Drawing
// --------------------------------------------------------------------------------------------

//>    @method    Layout.initWidget()
//        sets up the layout for various management duties (various observations of member canvases,
//        initialization of sizes, array, etc.)
//<
initWidget : function () {
    if (isc._traceMarkers) arguments.__this = this;
    // initialize "vertical" for "orientation", or vice versa
    var Layout = isc.Layout;
    if (this.vertical == null) {
        this.vertical = (this.orientation == Layout.VERTICAL);
    } else {
        this.orientation = (this.vertical ? Layout.VERTICAL : Layout.HORIZONTAL);
    }

    // for horizontal layouts in RTL, set (or flip) the reverseOrder flag
    if (this.isRTL() && !this.vertical) this.reverseOrder = !this.reverseOrder;

    if (this.members == null) this.members = [];
    else if (!isc.isA.Array(this.members)) this.members = [this.members];

    // NOTE: trickiness with timing of creating members/children/peers:
    // Once we add the "members" as children or peers, Canvas code will auto-create any members
    // specified as instantiation blocks rather than live widgets.  Therefore, we make sure all
    // members have been instantiated here, because if we allow Canvas code to do the
    // instantiation, our "members" array will contain pointers to instantiation blocks instead
    // of the live Canvii.
    if (this.membersAreChildren) {
        if (this.members.length == 0 && this.children != null &&
            !this._allGeneratedChildren())
        {
            // since no members were specified, but children were specified, and this is a
            // Layout, assume all children are members.  NOTE: don't be fooled by having a
            // children Array that contains only generated components, which doesn't indicate
            // old-style usage, rather it indicates a Layout subclass that creates
            // non-member children.

            // NOTE: ensure this.members contains live Canvii
            this.members = this.children = this.createMemberCanvii(this.children);
        } else {
            // explicit list of members: create them and add them to the children array
            // NOTE: ensure this.members contains live Canvii
            this.members = this.createMemberCanvii(this.members);
            if (this.children == null) this.children = [];
            this.children.addList(this.members);
        }

    } else {
        this.logInfo("members are peers", "layout");

        // we override drawPeers() to do our special drawing.  The Layout itself *will not draw*
        // since there's no need.

        // override draw() to avoid actually drawing this Canvas.

        this.addMethods({draw:this._drawOverride});

        // explicit list of members: create them and add them to the peers array
        // NOTE: ensure this.members contains live Canvii
        this.members = this.createMemberCanvii(this.members);
        if (this.peers == null) this.peers = [];
        this.peers.addList(this.members);
    }

    // set up per-side margin properties based on settings
    this.setLayoutMargin();
     // fire membersChanged() if we have members
    if (this.members && this.members.length > 0) this._membersChanged();
},

// createMemberCanvii - resolves specified members / children to actual canvas instances, and
// unlike createCanvii, clears out anything that didn't resolve to a Canvas with a warning
createMemberCanvii : function (members) {
    members = this.createCanvii(members);
    for (var i = members.length-1; i >= 0; i--) {
        // Skip null entries - we handle these separately
        if (members[i] == null) continue;
        if (!isc.isA.Canvas(members[i])) {
            this.logWarn("Layout unable to resolve member:" + this.echo(members[i]) +
                         " to a Canvas - ignoring this member");
            members.removeAt(i);
        }
    }
    return members;
},

_allGeneratedChildren : function () {
    for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        if (child != null && !child._generated) return false;
    }
    return true;
},

// Margins handling
// ---------------------------------------------------------------------------------------

//> @method layout.setLayoutMargin()
// Method to force a reflow of the layout after directly assigning a value to any of the
// layout*Margin properties. Takes no arguments.
//
// @param [newMargin] (int) optional new setting for layout.layoutMargin.  Regardless of whether a new
//                          layout margin is passed, the layout reflows according to the current settings
//                          for layoutStartMargin et al
//
// @group layoutMargin
// @visibility external
//<

setLayoutMargin : function (newMargin) {

    if (newMargin != null) this.layoutMargin = newMargin;

    var lhm = this.layoutHMargin,
        lvm = this.layoutVMargin,
        lm = this.layoutMargin,
        // if we are reversed and eg horizontal, the start margin should be on the right, etc
        sm = this.reverseOrder ? this.layoutEndMargin : this.layoutStartMargin,
        em = this.reverseOrder ? this.layoutStartMargin : this.layoutEndMargin;

    var lpm, rpm, tpm, bpm;
    if (this.paddingAsLayoutMargin) {
        var padding = this._calculatePadding();
        lpm = padding.left; rpm = padding.right;
        tpm = padding.top; bpm = padding.bottom;
    }



    this._leftMargin = this._firstNonNull(this.layoutLeftMargin,
                                          (!this.vertical ? sm : null),
                                          lhm, lm, lpm, 0);
    this._rightMargin = this._firstNonNull(this.layoutRightMargin,
                                           (!this.vertical ? em : null),
                                           lhm, lm, rpm, 0);
    this._topMargin = this._firstNonNull(this.layoutTopMargin,
                                          (this.vertical ? sm : null),
                                          lvm, lm, tpm, 0);
    this._bottomMargin = this._firstNonNull(this.layoutBottomMargin,
                                           (this.vertical ? em : null),
                                           lvm, lm, bpm, 0);

    this._breadthChanged = true;
    this.reflow();
},

_getSideMargin : function (vertical) {
    if (this._leftMargin == null) this.setLayoutMargin();

    if (vertical) return this._leftMargin + this._rightMargin;
    else return this._topMargin + this._bottomMargin;
},
_getBreadthMargin : function () { return this._getSideMargin(this.vertical); },
_getLengthMargin : function () { return this._getSideMargin(!this.vertical); },

// ---------------------------------------------------------------------------------------

// draw() override for members-aren't-children mode.
_drawOverride : function () {
    //!DONTCOMBINE
    if (isc._traceMarkers) arguments.__this = this;
    if (!this.membersAreChildren) {
        // we draw the members now, and never draw the Layout as such

        this._setupMembers();

        // draw all the other members.
        this.layoutChildren(this._$initial_draw);

        this.drawPeers();
        this._drawn = true;
        return;
    }
    //StackDepth do a manual Super to avoid stack depth (and its faster)
    isc.Canvas._instancePrototype.draw.apply(this, arguments);
    //this.Super("draw", arguments);
},


// if our members are peers, suppress the normal behavior of resizing peers with the parent
resizePeersBy : function (a,b,c) {
    if (!this.membersAreChildren) return;

    isc.Canvas._instancePrototype.resizePeersBy.call(this, a,b,c);
    //this.Super("resizePeersBy", arguments);
},

markForRedraw : function () {
    if (this.membersAreChildren) return this.Super("markForRedraw", arguments);
    // if members aren't children, we don't draw, so ignore the redraw and just treat it as
    // dirtying the layout
    this.reflow("markedForRedraw");
},

// NOTE: we need to override drawChildren because if we don't, we will have to run the layout
// policy after the children have already been drawn, hence resizing them all and causing them
// to redraw.
drawChildren : function () {
    if (this.membersAreChildren) {
        // members are all children: handle drawing them specially
        this._setupMembers();

        // draw all the members.
        // NOTE: odd behavior of Layouts: because layoutChildren() skips hidden members, members
        // which are initially hidden DO NOT DRAW.  This is unlike any other Canvas
        // parent-child relationship, where it is guaranteed that all children have been drawn
        // if the parent has been drawn.  The primary reason not to draw hidden members is
        // performance.
        this.layoutChildren(this._$initial_draw);

        // if there are any children who are not members, call draw on them.  NOTE: a typical
        // case is the *peers of our members*.  This also implies that we must draw members
        // before non-member children, since peers must draw after their masters.
        this._drawNonMemberChildren();
    }
    // if members aren't children, we don't draw ourselves, so we can't draw children
    return;
},

// We manage our members' tab index.

_memberCanFocus : function (member) {
    return true;
},

//>    @method    layout._setupMembers()
// Do one time setup of members.
// Sets initial breadth for all members.
// Returns the set of members that should be predrawn.
//<
_setupMembers : function () {
    if (!this.members) return;
    for (var i = 0; i < this.members.length; i++) {
        var member = this.members[i];
        if (member == null) {
            this.logWarn("members array: " + this.members + " includes null entry at position "
                         + i + ". Removing");
            this.members.removeAt(i);
            i-=1;
            continue;
        }

        // If the member can be focused upon, and doesn't have a user-defined tab-index, make sure
        // it appears at the end of the current set of members in the tab order.
        if (this._memberCanFocus(member) &&
            (member._autoTabIndex || member.tabIndex == null))
        {
            this.updateMemberTabIndex(member);
        }

        // set each member's breadth
        this.autoSetBreadth(member);
    }
},

// when one of our members 'canFocus' property changes, update it's tab index to put it in
// the right place in the tab order.
childCanFocusChanged : function (member) {
    if (!this.members.contains(member)) return;
    this.updateMemberTabIndex(member);
},

// _drawNonMemberChildren
// Iterate through the children array, and for any children that are not members, draw them without
// managing their layout
// (Duplicates some code to achieve this from Canvas.drawChildren())
_drawNonMemberChildren : function () {

    // bail for the case where members are not children for now
    if (!this.membersAreChildren || !this.children) return;

    for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        if (this.members.contains(child)) continue;

        if (!isc.isA.Canvas(child)) {
            child.autoDraw = false;
            child = isc.Canvas.create(child);
        }

        if (!child.isDrawn()) child.draw();
    }
},

// Setting member sizes
// --------------------------------------------------------------------------------------------

//> @attr layout.managePercentBreadth (Boolean : true : IR)
// If set, a Layout with breadthPolicy:"fill" will specially interpret a percentage breadth on
// a member as a percentage of available space excluding the +link{layoutMargin}.  If false,
// percentages work exactly as for a non-member, with layoutMargins, if any, ignored.
// @visibility external
//<
managePercentBreadth:true,

//> @method layout.getMemberDefaultBreadth() [A]
// Return the breadth for a member of this layout which either didn't specify a breadth or
// specified a percent breadth with +link{managePercentBreadth}:true.
// <P>
// Called only for Layouts which have a +link{type:LayoutPolicy,layout policy} for the breadth
// axis of "fill", since Layouts with a breadth policy of "none" leave all member breadths alone.
//
// @param member (Canvas) Component to be sized
// @param defaultBreadth (Number) Value of the currently calculated member breadth. This
//      may be returned verbatim or manipulated in this method.
// @group layoutMember
// @visibility external
//<


_getMemberDefaultBreadth : function (member) {
    var explicitBreadth = this._explicitBreadth(member),
        percentBreadth = isc.isA.String(explicitBreadth) && isc.endsWith(explicitBreadth,this._$percent)
                    ? explicitBreadth : null,
        availableBreadth = Math.max(this.getBreadth() - this._getBreadthMargin(), 1);


    if (this._willScrollLength && !this.leaveScrollbarGap) {
        //this.logWarn("resizeMembers using smaller breath for scrolling, overflowersOnly: " +
        //             overflowersOnly);
        availableBreadth -= this.getScrollbarSize();
    }

    var breadth = (percentBreadth == null ? availableBreadth :
                   Math.floor(availableBreadth * (parseInt(percentBreadth)/100)));

    // call user-specified override, if any
    if (this.getMemberDefaultBreadth == null) return breadth;
    return this.getMemberDefaultBreadth(member, breadth);
},

// sets the member's breadth if the member does not have an explicitly specified breadth and
// this layout alters member breadths.  Returns true if the member's breadth was changed, false
// otherwise
autoSetBreadth : function (member) {
    if (!this.shouldAlterBreadth(member)) return false;

    // set layoutInProgress, otherwise, we'll think the resize we're about to do was done by the
    // user and treat it as an explicit size
    var wasInProgress = this._layoutInProgress;
    this._layoutInProgress = true;

    this.setMemberBreadth(member, this._getMemberDefaultBreadth(member));

    this._layoutInProgress = wasInProgress;


    return true;
},

// return whether this member should be resized on the perpendicular axis.
shouldAlterBreadth : function (member) {
    // any member with an explicit breadth setting is left alone (hence will stick out or be
    // smaller than the breadth of the layout)
    var explicitBreadth = this._explicitBreadth(member);
    if (explicitBreadth != null) {
        // managePercentBreadths if so configured.  For any other explicit breath, let the
        // member size itself.
        return (this.managePercentBreadth &&
                this.getBreadthPolicy() == isc.Layout.FILL &&
                isc.isA.String(explicitBreadth) &&
                isc.endsWith(explicitBreadth,this._$percent));

    }

    // NOTE: overflow:visible members: if the policy indicates that we change their breadth,
    // what we're basically setting is a minimum, and also advising the browser as to the optimal
    // point to wrap their content if it's wrappable.  Once such a member is drawn, it may exceed
    // the layout's breadth, similar to a member with an explicit size.


    if (this.vertical && member.inherentWidth) return false;

    // members will be set to the breadth of the layout if they have no explicit size of their own
    if (this.getBreadthPolicy() == isc.Layout.FILL) return true;

    // with no breadth policy, don't change member breadth
    return false;
},

// move these canvases offscreen so that we can find out their size
_moveOffscreen : function (member) {
    return isc.Canvas.moveOffscreen(member);
},

// return the total space dedicated to margins or resizeBars
getMarginSpace : function () {
    var marginSpace = this._getLengthMargin();
    for (var i = 0; i < this.members.length; i++) {
        var member = this.members[i];

        if (member._computedShowResizeBar) {
            // leave room for resizeBar
            marginSpace += this.resizeBarSize;
        } else if (i < this.members.length - 1 && !this._shouldIgnoreMember(this.members[i+1])) {
            // leave room for margins if not the last visible member
            marginSpace += this.membersMargin;
        }

        // leave extra space on a member-by-member basis
        marginSpace += this.getMemberGap(member);
    }

    // in the previous condition chain we're skipping membmers[0] so:
    if (this.members.length != 0 && this._shouldIgnoreMember(this.members[0]) ) {
        // if the first member is hidden => ignored we're removing its margin size.
        marginSpace -= this.membersMargin;
    }

    // re add 1 * this.memberOverlap so we don't clip the member closest to our ege
    if (this.memberOverlap != null) marginSpace += this.memberOverlap
    return marginSpace;
},

// return the total space to be allocated among members by the layout policy: the specified
// size minus space taken up by margins and resizeBars
getTotalMemberSpace : function () {
    return this.getLength() - this.getMarginSpace();
},

// get the total length of all members including margins and resizeBars, which may exceed the
// specified size of the layout if the layout as a whole overflowed
_getTotalMemberLength : function () {
    var totalMemberLength = 0;
    for (var i = 0; i < this.members.length; i++) {
        var member = this.members[i];
        if (this._shouldIgnoreMember(member)) continue;
        totalMemberLength += this.getMemberLength(member);
    }
    return totalMemberLength + this.getMarginSpace();
},

// This method prevents the member from being repositioned / resized when we reflow, even
// if it's visible
ignoreMember : function (member) {
    if (!member || !this.members || this.members.indexOf(member) == -1) return;
    member._isIgnoringLayout = true;
},

// Allow a member that was previously being ignored to respond to reflow.
stopIgnoringMember : function (member) {
    member._isIgnoringLayout = false;
    this.reflow();
},

isIgnoringMember : function (member) {
    if (member._isIgnoringLayout)
        return member._isIgnoringLayout;
    return false;
},

// Helper method to determine whether the specified member should be resized / relayed out when
// layoutChildren / reflow
// Returns true if we're ignoring the member, or its hidden.
_shouldIgnoreMember : function (member) {

    if (member.visibility == isc.Canvas.HIDDEN
        && !(member._edgedCanvas && member._edgedCanvas.isVisible())) return true;
    if (this.isIgnoringMember(member)) return true;
    return false;
},

// Allow a member with a managed Z order (via stackZIndex) to be unmanaged.
// DO NOT MANIPULATE _isIgnoringZIndex DIRECTLY! Side effects may be necessary (notably
// when one stops ignoring the member).
ignoreMemberZIndex : function (member) {
    if (!member || !this.members || this.members.indexOf(member) == -1) return;
    member._isIgnoringZIndex = true;
    this.reflow();
},

stopIgnoringMemberZIndex : function (member) {
    member._isIgnoringZIndex = false;
    this.reflow();
},

_isIgnoringMemberZIndex : function (member) {
    if (this.isIgnoringMember(member))
        return true;
    else if (member._isIgnoringZIndex)
        return member._isIgnoringZIndex;
    return false;
},

_$layout : "layout",
// gather the sizes settings that should be passed to the layout policy
// two modes: normal mode, or mode where members that can overflow are treated as being fixed
// size at their drawn size
gatherSizes : function (overflowAsFixed, layoutInfo, sizes) {
    if (!layoutInfo) {
        // re-use a per-instance array for storing layoutInfo
        layoutInfo = this._layoutInfo;
        if (layoutInfo == null) {
            layoutInfo = this._layoutInfo = [];
        } else {
            layoutInfo.length = 0;
        }
    }

    var policy = this.getLengthPolicy();

    // whether to put together info for a big layout report at the end of the resizing/policy run
    var report = this.logIsInfoEnabled(this._$layout);

    // detect sizes that should be regarded as fixed
    for (var i = 0; i < this.members.length; i++) {
        var member = this.members[i];

        var memberInfo = layoutInfo[i];
        if (memberInfo == null) {
            memberInfo = layoutInfo[i] = {};
        }

        // skip hidden members
        if (this._shouldIgnoreMember(member)
            //>Animation
            // If we're about to animateShow() a new member, it's visibility will be hidden,
            // but we need to determine its initial size anyway
            && !member._prefetchingSize //<Animation
           ) {
            memberInfo._policyLength = 0;
            if (report) memberInfo._lengthReason = "hidden";
            continue;
        }

        // if a member has an inherent length, we always respect it as a fixed size.  If we
        // have no sizing policy, in effect everything is "inherent length": we just ask it for
        // it's size; if it has a percent size or other non-numeric size, it interprets it
        // itself
        if (this.memberHasInherentLength(member) || policy == isc.Layout.NONE) {
            memberInfo._policyLength = this.getMemberLength(member);
            // we never want to set a length for inherent size members
            if (report) {
                memberInfo._lengthReason = (policy == isc.Layout.NONE ? "no length policy" :
                                           "inherent size");
            }
            continue;
        }

        // if we are treating overflowing members as fixed (second pass), members that can
        // overflow should now be treated as fixed size by the policy
        if (overflowAsFixed && this._overflowsLength(member)) {
            var drawnLength = this.getMemberLength(member);

            // if the member's drawn size doesn't match the size we assigned it in the first
            // pass, it has overflowed.
            if (drawnLength != sizes[i]) {
                if (report) {
                    this.logInfo("member: " + member + " overflowed.  set length: " + sizes[i] +
                                 " got length: " + drawnLength, "layout");
                }
                memberInfo._overflowed = true;
                memberInfo._policyLength = drawnLength;
            }
            continue;
        }

        // respect any explicitly specified size (this includes percent)
        if (this._explicitLength(member) != null) {
            memberInfo._policyLength = this.vertical ? member._userHeight : member._userWidth;
            if (report) memberInfo._lengthReason = "explicit size";
            continue;
        }

        // If the already calculated size exceeds the specified maxHeight/width or is smaller than
        // the specified minHeight/width, clamp to those boundaries.


        if (this.respectSizeLimits) {
            var minLength = this.vertical ? member.minHeight : member.minWidth,
                maxLength = this.vertical ? member.maxHeight : member.maxWidth;
            if (minLength != null && sizes[i] != null && minLength > sizes[i]) {
                memberInfo._policyLength = minLength;
                if (report) memberInfo._lengthReason = "minimum size";
                continue;
            }
            if (maxLength != null && sizes[i] != null && maxLength < sizes[i]) {
                memberInfo._policyLength = maxLength;
                if (report) memberInfo._lengthReason = "maximum size";
                continue;
            }
        }

        // no size specified; ask for as much space as is available
        if (memberInfo._policyLength == null) {
            memberInfo._policyLength = this._$star;
            if (report) memberInfo._lengthReason = "no length specified";
        }
    }
    return layoutInfo;
},

// resize the members to the sizes given in the sizes[] array.  If overflowersOnly is true, only
// resize members that can overflow.
//>Animation
_resizeAnimations:["show", "hide", "rect"],
//<Animation


_hasCosmeticOverflowOnly : function () {
    var members = this.members,
        pageRight,
        pageBottom;
    for (var i = 0; i < members.length; ++i) {
        var member = members[i];
        if (!member) continue; //support sparse arrays

        var memberPeers = member.peers;
        if (memberPeers) {
            for (var j = 0; j < memberPeers.length; ++j) {
                var peer = memberPeers[j];
                if (peer._cosmetic) {
                    if (pageRight == null) {
                        var clipHandle = this.getClipHandle();
                        pageRight = this.getPageRight() - isc.Element.getRightBorderSize(clipHandle);
                        pageBottom = this.getPageBottom() - isc.Element.getBottomBorderSize(clipHandle);
                    }

                    var peerRect = peer.getPeerRect();
                    if ((peerRect[0] + peerRect[2]) >= pageRight ||
                        (peerRect[1] + peerRect[3]) >= pageBottom)
                    {
                        // Proceed on to checking whether any other non-cosmetic child has
                        // a right/bottom coordinate outside of the specified size.
                        for (var k = 0; k < members.length; ++k) {
                            member = members[k];
                            if (member.getPageRight() >= pageRight ||
                                member.getPageBottom() >= pageBottom)
                            {
                                // One of the members is causing overflow, so this layout does
                                // not have purely cosmetic elements causing overflow.
                                return false;
                            }
                        }
                        return true;
                    }
                }
            }
        }
    }
    return false;
},

resizeMembers : function (sizes, layoutInfo, overflowersOnly) {
    var report = this.logIsInfoEnabled(this._$layout);

    for (var i = 0; i < this.members.length; i++) {
        var member = this.members[i],
            memberInfo = layoutInfo[i];

        // ignore hidden members and explicitly ignored members
        if (this._shouldIgnoreMember(member)) continue;

        // if we're only resizing overflowers, skip other members
        if (overflowersOnly && !this._overflowsLength(member)) continue;

        // get the breadth this member should be set to, or null if it shouldn't be changed
        var breadth = null;
        if (this.shouldAlterBreadth(member)) {
            if (report)
                memberInfo._breadthReason = "breadth policy: " + this.getBreadthPolicy();

            breadth = memberInfo._breadth = this._getMemberDefaultBreadth(member);
        } else {
            // don't set breadth
            memberInfo._breadth = this.getMemberBreadth(member);
            if (report) {
                memberInfo._breadthReason =
                    (this.getBreadthPolicy() == isc.Layout.NONE ? "no breadth policy" :
                                                "explicit size");
            }
        }

        // get the length we should set the member to

        var length = null;

        if (this.getLengthPolicy() != isc.Layout.NONE &&
            (!this.memberHasInherentLength(member) && !memberInfo._overflowed))
        {
            length = memberInfo._resizeLength = sizes[i];
        }

        // avoid trying to resize an overflowed member to less than its overflowed size
        // (if the width is not also changing, and the member isn't dirty for another reason)
        if (length != null && this._overflowsLength(member) && !member.isDirty() &&
            (!member._hasCosmeticOverflowOnly || !member._hasCosmeticOverflowOnly()))
        {
            var specifiedLength = (this.vertical ? member.getHeight() : member.getWidth()),
                visibleLength = this.getMemberLength(member);
            // member has overflowed length
            if (visibleLength > specifiedLength &&
                // the new length is less than or equal to the member's overflowed size
                length <= visibleLength &&
                // breadth won't change or isn't increasing
                (breadth == null || breadth <= this.getMemberBreadth(member)))
            {
                if (report) this.logInfo("not applying " + this.getLengthAxis() + ": " + length +
                                         " to overflowed member: " + member +
                                         " w/" + this.getLengthAxis() + ": " + visibleLength,
                                         "layout");
                length = null;
            }
        }

        if (this.logIsDebugEnabled(this._$layout)) this._reportResize(member, breadth, length);

        //>Animation
        // Don't resize a member that's in the process of animate-resizing
        if (!member.isAnimating(this._resizeAnimations)) {//<Animation
        if (this.vertical) {
            member.resizeTo(breadth, length);
        } else {
            member.resizeTo(length, breadth);
        }
        //>Animation
        }//<Animation

        // redraw the member if it changed size, so we can get the right size for stacking
        // purposes (or draw the member if it's never been drawn)
        if (member.isDrawn()) {
            if (member.isDirty()) member.redraw("Layout getting new size");
        } else {
            // cause undrawn members to draw (drawOffscreen because we haven't positioned them
            // yet and don't want them to momentarily appear stacked on top of each other)
            if (!member.isDrawn()) member._needsDraw = true;
        }
    }
},

// if stackZIndex is "firstOnTop" or "lastOnTop", ensure all managed members have
// consistently increasing or decreasing Z-order, except members which should be ignored
// (such as selected tabs in a TabBar which must be at the top).
_enforceStackZIndex : function () {
    if (!this.stackZIndex || this.members.length < 2) return;

    // advance to the first non-ignored member
    for (var firstStacked=0; firstStacked<this.members.length; firstStacked++)
        if (!this._isIgnoringMemberZIndex(this.members[firstStacked])) break;

    var thisMember=this.members[firstStacked], thisZ=thisMember.getZIndex();
    var lastMember, lastZ;

    // compare the Z-order of each stackable member to the last stackable member before
    // it. Adjust the Z-order if it does not match the stack ordering.
    for (var i = firstStacked+1; i < this.members.length; i++) {
        if (this._isIgnoringMemberZIndex(this.members[i])) continue;
        lastMember = thisMember;
        lastZ = lastMember.getZIndex();
        thisMember = this.members[i];
        thisZ = thisMember.getZIndex();

        if ((thisZ <= lastZ) && this.stackZIndex == "lastOnTop")
            thisMember.moveAbove(lastMember);
        else if ((thisZ >= lastZ) && this.stackZIndex == "firstOnTop")
            thisMember.moveBelow(lastMember);
    }
},

//>Animation When the member is in the middle of an animated move, avoid attempting to move as
// part of layout.
_moveAnimations:["rect", "move"], //<Animation


stackMembers : function (members, layoutInfo, updateSizes) {

    if (updateSizes == null) updateSizes = true;

    // top/left coordinate of layout: if members are children, placing a member at 0,0
    // places it in the top left corner of the Layout, since child coordinates are relative
    // to the parent.  Otherwise, if members are peers, the top/left corner is the
    // offsetLeft/Top with respect to the Layout's parent
    var layoutLeft = (this.membersAreChildren ? 0 : this.getOffsetLeft()),
        layoutTop = (this.membersAreChildren ? 0 : this.getOffsetTop()),
        // support reversing the order members appear in
        reverse = this.reverseOrder,
        direction = (reverse ? -1 : 1);



    // breadth to use for centering based on specified size, which we'll use as is
    // for the clipping/scrolling case, and acts as a minimum for the overflow case.
    // Note getInner* takes into account native margin/border
    var centerBreadth = (this.vertical ? this.getInnerWidth() : this.getInnerHeight())
            - this._getBreadthMargin();

    if ((this.vertical && this.canOverflowWidth()) ||
        (!this.vertical && this.canOverflowHeight()))
    {
        // overflow case.  Note we can't just call getScrollWidth() and subtract off synthetic
        // margins because members have not been placed yet.
        for (var i = 0; i < this.members.length; i++) {
            var member = this.members[i];
            // ignore hidden members and explicitly ignored members
            if (this._shouldIgnoreMember(member)) continue;
            var value = this.getMemberBreadth(member);
            if (value > centerBreadth) centerBreadth = value;
        }
    }
    if (this.logIsDebugEnabled(this._$layout)) {
        this.logDebug("centering wrt visible breadth: " + centerBreadth, this._$layout);
    }


    var totalLength;
    if (reverse) {

        var allowNegative = this.isRTL() && this.overflow != isc.Canvas.VISIBLE;
        if (allowNegative) {


            totalLength = this.getLength();
        } else {
            totalLength = Math.max(this.getLength(), this._getTotalMemberLength());
        }
    }

    // start position of the next member on length axis.
    // if reversing, start stacking at end coordinate and work backwards.  Note that this
    // effectively creates right/bottom alignment by default.
    var nextMemberPosition = (this.vertical ?
                                (!reverse ? layoutTop : layoutTop + totalLength) :
                                (!reverse ? layoutLeft : layoutLeft + totalLength)
                             );
    // if align has been set to non-default,
    if (this.align != null) {
        var totalMemberLength = this._getTotalMemberLength(),
            visibleLength = Math.max(this.getLength(), totalMemberLength),
            remainingSpace = visibleLength - totalMemberLength;


        if (((!reverse && (this.align == isc.Canvas.BOTTOM || this.align == isc.Canvas.RIGHT)) ||
            (reverse && (this.align == isc.Canvas.LEFT || this.align == isc.Canvas.TOP))))
        {
            // leave the space that would have been at the end at the beginning instead.
            // if reversed, hence normally right/bottom aligned, and align has been set to
            // left/top, subtract off remaining space instead.  NOTE: can't simplify reversal to
            // just mean right/bottom align: reverse stacking starts from endpoint and subtracts
            // off sizes during stacking.
            nextMemberPosition += (direction * remainingSpace);
        } else if (this.align == isc.Canvas.CENTER) {
            nextMemberPosition += (direction * Math.round(remainingSpace/2));
        }
    }

    // start position of all members on breadth axis
    var defaultOffset = (this.vertical ? layoutLeft + this._leftMargin :
                                         layoutTop + this._topMargin),
        lastMemberHadResizeBar = false,
        lastMemberWasHidden = false,
        numHiddenMembers = 0;

    for (var i = 0; i < members.length; i++) {
        var member = members[i],
            // NOTE: layoutInfo is optional, only used for reporting purposes when stackMembers is
            // called as part of a full layoutChildren run
            memberInfo = layoutInfo ? layoutInfo[i] : null;
        // margin before the member / room for resizeBar
        if (i == 0) {
            // first element is preceded by the outer margin of the layout as a whole.
            // NOTE: the last element is implicitly followed by the outer margin because space
            // for it is subtracted before we determine sizes.
            var startMargin;
            if (this.vertical) startMargin = (reverse ? this._bottomMargin : this._topMargin);
            else startMargin = (reverse ? this._rightMargin : this._leftMargin);
            nextMemberPosition += (direction * startMargin);
        } else {
            if (lastMemberHadResizeBar) {
                // if the last member showed a resizeBar, leave room for it
                nextMemberPosition += (direction * this.resizeBarSize);
            } else if (!lastMemberWasHidden) {
                // otherwise leave the members margin (note: avoid stacking margins if a member
                // is hidden)
                nextMemberPosition += (direction * this.membersMargin);
            }
        }

        //>Animation
        // Avoid interrupting animations in progress with any kind of move
        var animating = member.isAnimating(this._moveAnimations); //<Animation

        // skip hidden members
        if (this._shouldIgnoreMember(member)) {

            if (!this.isIgnoringMember(member)
                //>Animation
                && !animating   //<Animation
               ) {
                member.moveTo(layoutLeft + this._leftMargin, layoutTop + this._topMargin);
            }
            // if a hidden member has a resizeBar (it was previously visible) leave the
            // resizeBar showing, and place it properly
            if (member._computedShowResizeBar) {
                var breadth = this.getBreadth() - this._getBreadthMargin();
                this.makeResizeBar(member, defaultOffset, nextMemberPosition, breadth);
                lastMemberHadResizeBar = true;
            } else {
                if (member._resizeBar != null) member._resizeBar.hide();
                lastMemberHadResizeBar = false;
            }
            lastMemberWasHidden = true;
            numHiddenMembers++;
            continue;
        } else {
            lastMemberWasHidden = false;
        }

        // handle alignment (default is left/top)
        var offset = defaultOffset,
            Canvas = isc.Canvas,
            layoutAlign = this.getLayoutAlign(member);
        // NOTE: the centerBreadth properly subtracts out layoutMargins
        if (layoutAlign == Canvas.RIGHT || layoutAlign == Canvas.BOTTOM) {
            offset = centerBreadth - this.getMemberBreadth(member)
                + (this.vertical ? this._leftMargin : this._topMargin);
        } else if (layoutAlign == Canvas.CENTER) {
            offset = Math.floor((centerBreadth - this.getMemberBreadth(member))/2)
                    + (this.vertical ? this._leftMargin : this._topMargin);
        }
        if (this.getMemberOffset != null)
            offset = this.getMemberOffset(member, offset, layoutAlign);

        var memberLength = this.getMemberLength(member);
        //>Animation
        if (!animating) {//<Animation
        // move the member into position
        if (this.vertical) {
            if (!reverse) member.moveTo(offset, nextMemberPosition);
            else member.moveTo(offset, nextMemberPosition-memberLength);
        } else {
            if (!reverse) member.moveTo(nextMemberPosition, offset);
            else member.moveTo(nextMemberPosition-memberLength, offset);
        }

        //>Animation
        } //<Animation

        // next member will be placed after this one
        nextMemberPosition += (direction * memberLength);
        // leave extra space on a member-by-member basis
        nextMemberPosition += (direction * this.getMemberGap(member));

        // show a resize bar for members that request it
        if (member._computedShowResizeBar) {
            var breadth = this.getBreadth() - this._getBreadthMargin();
            this.makeResizeBar(member, defaultOffset, nextMemberPosition, breadth);
        } else {
            // ensure we hide the resizebar for any hidden members.
            if (member._resizeBar != null) member._resizeBar.hide();
        }
        lastMemberHadResizeBar = member._computedShowResizeBar;

        // update memberSizes.  NOTE: this is only necessary when we have turned off the sizing
        // policy are doing stackMembers() only
        if (updateSizes) this.memberSizes[i - numHiddenMembers] = memberLength;

        // record length for reporting if being called as part of layoutChildren
        if (layoutInfo) memberInfo._visibleLength = memberLength;
    }
    // trim memberSizes to the currently visible members.  NOTE: this is only necessary when we have
    // turned off the sizing policy are doing stackMembers() only
    if (updateSizes) this.memberSizes.length = (i - numHiddenMembers);

    // Ensure that the reported scroll-size matches the scrollable area of this layout.
    if (this.overflow != isc.Canvas.VISIBLE) this._enforceScrollSize();

    this._enforceStackZIndex();
},

// determine the breadth axis alignment per member.
getLayoutAlign : function (member) {
    if (member.layoutAlign != null) return member.layoutAlign;
    if (this.defaultLayoutAlign != null) return this.defaultLayoutAlign;
    return this.vertical ? (this.isRTL() ? isc.Canvas.RIGHT : isc.Canvas.LEFT)
                          : isc.Canvas.TOP;
},


_enforceScrollSize : function () {

    var breadthLayoutMargin,
        lengthLayoutMargin,
        hasMargin = false, spacerForcesOverflow = false,

        lastMember,
        member,
        scrollBottom, scrollRight, vertical = this.vertical;

    // convert null margins to zero so we don't need to worry about doing math with them
    if (vertical) {
        lengthLayoutMargin = this._bottomMargin || 0;
        breadthLayoutMargin = this._rightMargin || 0;
    } else {
        lengthLayoutMargin = this._rightMargin || 0;
        breadthLayoutMargin = this._bottomMargin || 0;
    }

    if (lengthLayoutMargin > 0 || breadthLayoutMargin > 0) hasMargin = true;

    var innerWidth = this.getInnerWidth(),
        innerHeight = this.getInnerHeight();

    // If we have layout margins that cause scrolling, we need to find the bottom (or right)
    // of the last member, and the right (or bottom) of the broadest member to enforce scroll
    // size.
    // In this case just iterate through every member to find our broadest member.
    if (hasMargin) {
        for (var i = this.members.length-1 ; i >= 0; i--) {
            member = this.members[i];
            if (!member.isVisible()) continue;

            if (vertical) {
                if (lastMember == null) {
                    lastMember = member;
                    scrollBottom = member.getTop() + member.getVisibleHeight();
                }

                var right = member.getLeft() + member.getVisibleWidth();
                if (scrollRight == null || scrollRight < right) scrollRight = right;

            } else {
                if (lastMember == null) {
                    lastMember = member;
                    scrollRight = member.getLeft() + member.getVisibleWidth();
                }

                var bottom = member.getTop() + member.getVisibleHeight();
                if (scrollBottom == null || scrollBottom < bottom) scrollBottom = bottom;
            }
        }

        // If we had no visible members we still need a valid scrollBottom/scrollLeft
        // to enforce, or we'll end up trying to math on null values
        if (scrollBottom == null) scrollBottom = 0;
        if (scrollRight == null) scrollRight = 0;

    // if we have no layout margins, we will only need to enforce scrollSize if our last member
    // is a layout spacer and/or our broadest member is a layout spacer (and is wider than
    // this.innerWidth
    // In this case, for efficiency, iterate through our members array checking for a layout
    // spacer at the end, or one that effects the broadness of the content.
    // Then, iff we found a layoutSpacer that effects the broadness of the content, iterate
    // through all the other members to determine whether it's the broadest member in the
    // layout - as we may be able to avoid enforcing scroll size.
    } else {
        var spacerBreadthOverflow = false;
        for (var i = this.members.length-1 ; i >= 0; i--) {
            var member = this.members[i];
            if (isc.isA.LayoutSpacer(member) && member.isVisible()) {
                var width = member.getWidth(), height = member.getHeight();

                // spacer at end - always have to enforce overflow
                if (i == this.members.length-1) {
                    spacerForcesOverflow = true;
                    if (vertical) scrollBottom = member.getTop() + height;
                    else scrollRight = member.getLeft() + width;
                }
                // Otherwise only if we have a layout spacer member that is the widest member
                // and exceeds the available space
                if (vertical) {
                    if(width > innerWidth && (scrollRight == null || width > scrollRight)) {
                        spacerBreadthOverflow = true;
                        scrollRight = width;
                    }
                } else if (height > innerHeight &&
                          (scrollBottom == null || height > scrollBottom)) {
                    spacerBreadthOverflow = true;
                    scrollBottom = height;
                }
            }
        }

        // if spacerBreadthOveflow is true, we have a spacer that may be the widest member of
        // this layout.
        // If our last member is a layout spacer we know we have to enforce scroll size
        // - otherwise iterate through the members array again checking the widths of all
        //   non-layoutSpacer members to determine whether this is the widest member.

        if (spacerBreadthOverflow && !spacerForcesOverflow) {
            for (var i = this.members.length-1 ; i >= 0; i--) {
                var member = this.members[i];
                if (isc.isA.LayoutSpacer(member)) continue;

                if (this.vertical) {
                    var width = member.getVisibleWidth();
                    if (width >= scrollRight) {
                        spacerBreadthOverflow = false;
                        break;
                    }
                } else {
                    var height = member.getVisibleHeight();
                    if (height >= scrollBottom) {
                        spacerBreadthOverflow = false;
                        break;
                    }
                }
            }

            // at this point if spacerBreadthOverflow is true we need to enforce scroll breadth
            if (spacerBreadthOverflow) spacerForcesOverflow = true;
        }

        if (spacerForcesOverflow) {
            // Ensure we have a non-null position on both axes.
            // May not be the case if spacers only cause overflow in one direction.
            if (scrollRight == null) scrollRight = 1;
            if (scrollBottom == null) scrollBottom = 1;
        }

    }

    if (spacerForcesOverflow || hasMargin) {
        if (this.vertical) {
            scrollRight += breadthLayoutMargin;
            scrollBottom += lengthLayoutMargin;
        } else {
            scrollRight += lengthLayoutMargin;
            scrollBottom += breadthLayoutMargin;
        }
        this.enforceScrollSize(scrollRight, scrollBottom);
    }
    else this.stopEnforcingScrollSize();

},


// Override setOverflow:
// we only need to write out scroll-sizing divs iff we're not overflow visible (so need to be
// able to natively scroll to the bottom right even if we have no true HTML content there).
setOverflow : function (newOverflow, a, b, c, d) {
    var oldOverflow = this.overflow;
    if (oldOverflow == isc.Canvas.VISIBLE && newOverflow != isc.Canvas.VISIBLE) {
        this._enforceScrollSize();
    } else if (oldOverflow != isc.Canvas.VISIBLE && newOverflow == isc.Canvas.VISIBLE) {
        this.stopEnforcingScrollSize();
    }
    return this.invokeSuper(isc.Layout, "setOverflow", newOverflow, a, b, c, d);
},


//>    @method    layout.layoutChildren() [A]
// Size and place members according to the layout policy.
//<
layoutChildren : function (reason, deltaX, deltaY) {
    if (isc._traceMarkers) arguments.__this = this;

    // avoid doing a bunch of Layout runs as we blow away our members during a destroy()
    if (this.destroying) return;

    if (this._reflowCount == null) this._reflowCount = 1;
    else this._reflowCount++;


    if (!this.members) this.members = [];

    // mimic the superclass Canvas.layoutChildren() by resolving percentage sizes, but only for
    // percent sizes the layout doesn't specially manage.
    // Non-member children always interpret percents themselves.
    // However, if we have length policy:"fill", percentages specified for the length axis on
    // members have special meaning, and the member should not interpret them itself.
    // Likewise breadth-axis percentages when breadthPolicy is "fill" (handled in
    // shouldAlterBreadth()
    if (this.children && this.children.length) {
        for (var i = 0; i < this.children.length; i++) {
            this._resolvePercentageSizeForChild(this.children[i]);
        }
    }

    // don't layoutChildren() before draw() unless layoutChildren() is being called as part of
    // draw()
    if (!this.isDrawn() && reason != this._$initial_draw) return;

    // set a flag that we are doing layout stuff, so that we can ignore when we're notified that a
    // member has been resized
    var layoutAlreadyInProgress = this._layoutInProgress;
    this._layoutInProgress = true;

    if (deltaX != null || deltaY != null) {
        // since deltaX or deltaY was passed, we're being called from Canvas.resizeBy()

        // if we are resized on the breadth axis, set a marker so we know that we may have to
        // resize members on the breadth axis
        if ((this.vertical && isc.isA.Number(deltaX)) ||
            (!this.vertical && isc.isA.Number(deltaY)))
        {
            this._breadthChanged = true;
        }
    }

    if (this.isDrawn() && this.getLengthPolicy() == isc.Layout.NONE && !this._breadthChanged) {
        if (this.logIsInfoEnabled(this._$layout)) {
            this.logInfo("Restacking, reason: " + reason, this._$layout);
        }


        this.stackMembers(this.members);

        this._breadthChanged = false;
        this._layoutChildrenDone(reason, layoutAlreadyInProgress);
        return;
    //} else {
    //    this.logWarn("couldn't take shortcut, policy: " + this.getLengthPolicy() +
    //                 ", breadthChanged: " + this._breadthChanged);
    }
    this._breadthChanged = false;





    // get the amount the total amount of space available for members (eg, margins and room for
    // resizeBars is subtracted off)
    var totalSpace = this.getTotalMemberSpace();

    // Determine the sizes for the members
    var sizes = this._getMemberSizes(totalSpace),

        layoutInfo = this._layoutInfo;


    if (!this.scrollingOnLength() && this.overflow == isc.Canvas.AUTO &&
        sizes.sum() > this.getLength())
    {
        this.logInfo("scrolling will be required on length axis", this._$layout);
        this._willScrollLength = true;
    }

    // size any members that can overflow
    this.resizeMembers(sizes, layoutInfo, true);

    if (this.manageChildOverflow) this._suppressOverflow = true;
    //StackDepth draw() from here instead of having resizeMembers do it, to avoid stack


    for (var i = 0; i < this.members.length; i++) {
        var member = this.members[i],
            prevMemberCanFocus = this._memberCanFocus(member);
        if (member._needsDraw) {
            this._moveOffscreen(member);
            member.draw();
            member._needsDraw = null;

            // In some cases this draw() call will have changed the can-scroll / children
            // of the member - if so we need to slot the member into the layout's tab-order
            // now, since
            // - we've already run setupMembers
            // - the 'addChild' / 'canFocusChanged()' methods will not recognize that this
            //   member is a child of this layout (as it isn't yet)

            if (!prevMemberCanFocus && this._memberCanFocus(member)) {
                this.updateMemberTabIndex(member);
            }
        }
    }
    if (this.manageChildOverflow) this._completeChildOverflow(this.members);

    // gather sizes again, this time treating any members that can overflow as fixed size
    var finalSizes = this.memberSizes = this._getMemberSizes(totalSpace, true, sizes, layoutInfo);

    // anticipate scrolling again now that overflows, if any, have occurred (see above)
    if (!this._willScrollLength &&
        !this.scrollingOnLength() && this.overflow == isc.Canvas.AUTO &&
        finalSizes.sum() > this.getLength())
    {
        this.logInfo("scrolling will be required on length axis, after overflow",
                     this._$layout);
        this._willScrollLength = true;
    }

    // size all the rest of the members
    this.resizeMembers(finalSizes, layoutInfo, false);

    if (this.manageChildOverflow) this._suppressOverflow = true;
    //StackDepth draw() from here instead of having resizeMembers do it, to avoid stack
    for (var i = 0; i < this.members.length; i++) {
        var member = this.members[i];
        if (member._needsDraw) {
            this._moveOffscreen(member);
            member.draw();
            member._needsDraw = null;
        }
    }
    if (this.manageChildOverflow) this._completeChildOverflow(this.members);

    // stack the members
    this.stackMembers(this.members, layoutInfo);

    // report what happened
    this.reportSizes(layoutInfo, reason);

    this._layoutChildrenDone(reason, layoutAlreadyInProgress);
},

_resolvePercentageSizeForChild : function (child) {
    var percentHeight = child._percent_height,
        percentWidth = child._percent_width;

    if (child.snapTo) {
        child._resolvePercentageSize();
        return
    }

    var fillLength = (this.getLengthPolicy() == isc.Layout.FILL);

    // skip children with no percent sizes
    if (!(child._percent_left || child._percent_top ||
          percentHeight || percentWidth)) return;

    // if child has percent height/width on an axis where we have a sizing policy,
    // don't have the child apply the percent size itself if its a member
    if (fillLength && this.vertical) {
        if (percentHeight != null && this.members.contains(child)) percentHeight = null;
    } else if (fillLength && !this.vertical) {
        if (percentWidth != null && this.members.contains(child)) percentWidth = null;
    }

    child.setRect(child._percent_left, child._percent_top,
                  percentWidth, percentHeight);
},

// get target sizes for members, by gathering current sizes and applying stretchResizePolicy
_getMemberSizes : function (totalSpace, overflowAsFixed, sizes, layoutInfo) {

    // re-use an Array for storing gathered and calculate sizes.  Note this must be
    // per-instance as child widgets may be Layouts
    if (!sizes) {
        sizes = this._sizesArray;
        if (sizes == null) sizes = this._sizesArray = [];
        else sizes.length = this.members.length;
    }

    // Note: overflowAsFixed implies we're running a second pass through this method
    // In this case some of the sizes and layoutInfo passed in are up to date and will
    // be used by gatherSizes()

    // gather sizes for the members
    layoutInfo = this.gatherSizes(overflowAsFixed, layoutInfo, sizes);

    // apply the sizing policy
    this._getPolicyLengths(sizes, layoutInfo);

    return this.getClass().applyStretchResizePolicy(sizes, totalSpace, this.minMemberSize, true, this);

},

//StackDepth this strange factoring is to avoid a stack frame
_layoutChildrenDone : function (reason, layoutAlreadyInProgress) {

    this._willScrollLength = false;

    // the layout is now up to date and any changes we see from here on, we need to respond to
    this._layoutIsDirty = false;
    this._layoutInProgress = layoutAlreadyInProgress;


    // if moving and resizing of children has marked us as needing an adjustOverflow, run it
    // now.  Otherwise, it will run after a timer, and if we change size our parent will only
    // react to it after yet another timer, and the browser may repaint in the meantime,
    // creating too much visual churn.
    if (this._overflowQueued && this.isDrawn() &&
        // NOTE: adjustOverflow can call layoutChildren for eg scroll state changes, don't call
        // it recursively.
        !this._inAdjustOverflow &&
        // Also don't call it when we're resized, because resizing does an immediate
        // adjustOverflow anyway (unless we're redrawOnResize, in which it will be delayed and
        // *we* should do an immediate adjustOverflow)
        (reason != "resized" || this.shouldRedrawOnResize()))
    {
        if (this.notifyAncestorsOnReflow && this.parentElement != null) {
            this.notifyAncestorsAboutToReflow();
        }
        //this.logWarn("calling adjustOverflow, reason: " + reason);
        this.adjustOverflow();
        if (this.notifyAncestorsOnReflow && this.parentElement != null) {
            this.notifyAncestorsReflowComplete();
        }
    }

    // if we're not continuously enforcing the layout policy, set the policy to none
    if (!this.enforcePolicy) {
        this.vertical ? this.vPolicy = isc.Layout.NONE : this.hPolicy = isc.Layout.NONE;
    }
},

_getPolicyLengths : function (sizes, layoutInfo) {
    for (var i = 0; i < layoutInfo.length; i++) {
        sizes[i] = layoutInfo[i]._policyLength;
    }
},

//> @method layout.getMemberSizes()
//
// @return (Array) array of member sizes
// @visibility external
//<
getMemberSizes : function () {
    // callable publicly, so we clone
    if (this.memberSizes) return this.memberSizes.duplicate();
    return this.memberSizes;
},


getScrollWidth : function (calcNewValue) {
    if (isc._traceMarkers) arguments.__this = this;

    // handle deferred adjustOverflow
    if (this._deferredOverflow) {
        this._deferredOverflow = null;
        this.adjustOverflow("widthCheckWhileDeferred");
    }

    // size caching: adjustOverflow needs the old value of scrollWidth/scrollHeight in order to
    // correctly fire resized(), which is cached by the default
    // getScrollHeight()/getScrollWidth() methods, hence anyone who overrides those methods
    // needs to leave a cached value around.
    if (!calcNewValue && this._scrollWidth != null) return this._scrollWidth;

    // NOTE: we can have non-member children, but if so the margin isn't added to them, so we
    // need to calculate member and non-member size separately
    var childrenSize = this.children ? this._getWidthSpan(this.children, true) : 0,
        membersSize = this.members ? this._getWidthSpan(this.members, true) : 0,
    // NOTE: tacking margins onto the furthest right/bottom member implies that we are willing
    // to overflow specified size in order to maintain the right/bottom margin, which is the
    // intent.

        scrollSize = this.isRTL() && this.overflow != isc.Canvas.VISIBLE
                        ? Math.max(childrenSize, membersSize)
                        : Math.max(childrenSize, membersSize + this._rightMargin);

    if (this.overflow == isc.Canvas.VISIBLE &&
        this.useClipDiv && !this._willSuppressOuterDivPadding(false, true))
    {
        scrollSize += isc.Element._getHPadding(this.styleName);
    }

//     this.logWarn("childrenSize: " + childrenSize + ", memberSize: " + membersSize +
//                  ", _rightMargin: " + this._rightMargin + this.getStackTrace());

    return (this._scrollWidth = scrollSize);
},

getScrollHeight : function (calcNewValue) {
    if (isc._traceMarkers) arguments.__this = this;

    if (this._deferredOverflow) {
        this._deferredOverflow = null;
        this.adjustOverflow("heightCheckWhileDeferred");
    }

    if (!calcNewValue && this._scrollHeight != null) return this._scrollHeight;

    var childrenSize = this.children ? this._getHeightSpan(this.children, true) : 0,
        membersSize = this.children ? this._getHeightSpan(this.members, true) : 0,
        scrollSize = Math.max(childrenSize, membersSize + this._bottomMargin);

    return (this._scrollHeight = scrollSize);
},

// Rerunning layout
// --------------------------------------------------------------------------------------------

// does the layout need to be cleaned up
layoutIsDirty : function () {
    return this._layoutIsDirty == true;
},


//>    @method    layout.reflow() [A]
// Layout members according to current settings.
// <P>
// Members will reflow automatically when the layout is resized, members resize, the list of
// members changes or members change visibility.  It is only necessary to manually call
// <code>reflow()</code> after changing settings on the layout, for example,
// <code>layout.reverseOrder</code>.
//
// @param [reason] (string) reason reflow() had to be called (appear in logs if enabled)
//
// @visibility external
//<
reflow : function (reason) {
    // if we're already dirty, we've already set a timer to re-layout
    if (this._layoutIsDirty) return;

    if (this.isDrawn()) {
        this._layoutIsDirty = true;
        if (this.instantRelayout) {
            //isc.logWarn("reflowing NOW");
            this.layoutChildren(reason);
        } else {
            // pass in the current reflowCount so we don't do an extra reflow if reflowNow() is
            // called before the timer fires (happens every time with TEAs, since we currently
            // set a timer as well as a TEA, and can happen if reflowNow() is called
            // explicitly)
            var theLayout = this,
                reflowCount = this._reflowCount;
            isc.EH._setThreadExitAction(function () {
                //isc.logWarn("reflowing at end of thread");
                if (!theLayout.destroyed) theLayout.reflowNow(reason, reflowCount);
            });
        }
    }
},

//> @method layout.reflowNow() [A]
// Layout members according to current settings, immediately.
// <br>
// Generally, when changes occur that require a layout to reflow (such as members being shown
// or hidden), the Layout will reflow only after a delay, so that multiple changes cause only
// one reflow.  To remove this delay for cases where it is not helpful, reflowNow() can be
// called.
// @visibility external
//<
reflowNow : function (reason, reflowCount) {
    if (reflowCount != null && reflowCount < this._reflowCount) return;
    this.layoutChildren(reason);
},

// when a member resizes, rerun layout.
childResized : function (child, deltaX, deltaY, reason) {
    if (isc._traceMarkers) arguments.__this = this;

    //>Animation
    // If this is an animated resize, and we have the flag to suppress member animation, just
    // finish the animation as it's too expensive to respond to every step.
    if (this.suppressMemberAnimations) {
        var animating = false;
        if (child.isAnimating(this._$show)) {
            animating = true;
            child.finishAnimation(this._$show);
        }
        if (child.isAnimating(this._$hide)) {
            animating = true;
            child.finishAnimation(this._$hide);
        }
        // No need for explicit 'resize' animation - this falls through to setRect
        if (child.isAnimating(this._$setRect)) {
            animating = true;
            child.finishAnimation(this._$setRect);
        }

        if (animating) return;
    }
    //<Animation

    this._markForAdjustOverflow("child resize");

    if (this._layoutInProgress) {
        return;
    }

    /*
    this.logWarn("child resize for: " + child + ", reason: " + reason +
                 ", deltas: " + [deltaX, deltaY] +
                 ", percent sizes: " + [child._percent_width, child._percent_height] +
                 ", userSizes: " + [child._userWidth, child._userHeight] +
                 ", isMember: " + this.members.contains(child));
    */


    if (child._canvas_initializing) return;

    // non-member child, ignore
    if (!this.members.contains(child)) return;

    var member = child;


    if (reason != "overflow" && reason != "overflow changed" &&
        reason != "Overflow on initial draw") {

        if (deltaX != null && deltaX != 0) {
            var oldWidth = member._userWidth;
            member._userWidth = member._percent_width || member.getWidth();
            this._reportNewSize(oldWidth, member, reason, true);
        }
        if (deltaY != null && deltaY != 0) {
            var oldHeight = member._userHeight;
            member._userHeight = member._percent_height || member.getHeight();
            this._reportNewSize(oldHeight, member, reason);
        }
    }

    var reflowReason = isc.SB.concat("memberResized: (", deltaX, ",", deltaY, "): ", member.getID());
    //>Animation
    if (animating) this.reflowNow(reflowReason);
    else //<Animation
        this.reflow(reflowReason);
},

_reportNewSize : function (oldSize, member, reason, isWidth) {
    if (!this.logIsDebugEnabled(this._$layout)) return;
    var newSize = isWidth ? member._userWidth : member._userHeight;
    if (newSize != oldSize) {
        this.logDebug("new user " + (isWidth ? "width: " : "height: ") + newSize +
                      " for member " + member + ", oldSize: " + oldSize +
                      " reason: " + reason +
                      (this.logIsDebugEnabled("userSize") ? this.getStackTrace() : ""),
                      "layout");

    }
},

// when a member changes visibility, rerun layout.
// XXX reacting to childVisibilityChanged isn't adequate when members aren't children
childVisibilityChanged : function (child, newVisibility) {
    if (!this.members.contains(child)) return;

    //this.logWarn("childVisChange: child: " + child + this.getStackTrace());

    // an undrawn hidden member that gets show()n needs to be drawn on the next reflow, so we
    // can't take the stacking-only shortcut in layoutChildren()
    if (!child.isDrawn()) this._breadthChanged = true;

    // NOTE: With our default strategy reflowing on a timer, members made visible this way will
    // appear briefly at the wrong location before reflow occurs.  However, we don't want to
    // fix this by always calling reflowNow(), because it means that several show()s in the
    // same thread would reflow multiple times unnecessarily.  Ideally, we could set a special
    // kind of action to reflow() at the end of the current thread rather than on a timer.
    // Code that does a series of show()s can work around this problem by calling reflowNow()
    // at the end.
    this.reflow("member changed visibility: " + child);
    // If the child was showing a resize bar, and the resizeBy shows closed/open state,
    // update it's state
    var resizeBar = child._resizeBar;
    if (resizeBar == null || resizeBar.target != child) {
        resizeBar = null;
        var prevChild = this.members[this.members.indexOf(child)-1];
        if (prevChild && prevChild._resizeBar != null && prevChild._resizeBar.target == child) {
            resizeBar = prevChild._resizeBar;
        }

    }
    if (resizeBar != null && resizeBar.showGrip && resizeBar.showClosedGrip && resizeBar.label) {

        resizeBar.label.stateChanged();
    }
    this._markForAdjustOverflow("child visibility changed");
},

pageResize : function () {

    var reflowCount = this._reflowCount;
    this.Super("pageResize", arguments);
    // If the default 'pageResize' implementation resized this canvas it will already have
    // reflowed our members - if this didn't occur explicitly reflow now.
    if (this.isDrawn() &&
        (this._reflowCount == null || reflowCount == this._reflowCount))
    {
        this.reflow("pageResize");
    }
},

// Sections
// ---------------------------------------------------------------------------------------
// Full declarative section support (including mutex visibility), is provided by the SectionStack
// subclass of Layout, but Layout supports manual instantiation of SectionHeaders
sectionHeaderClick : function (sectionHeader) {
    var section = sectionHeader.section;
    if (section == null) return;

    if (!isc.isAn.Array(section)) section = [section];

    var anyVisible = false;
    for (var i = 0; i < section.length; i++) {
        if (isc.isA.String(section[i])) section[i] = window[section[i]];
        // NOTE: individual members of the group may be hidden, eg by clicking on resizeBars.
        // Assume if any members of the group are visible, the group should be considered
        // visible and hence be hidden.
        if (section[i].visibility != "hidden") anyVisible = true;
    }
    if (anyVisible) {
        section.map("hide");
        sectionHeader.setExpanded(false);
    } else {
        section.map("show");
        sectionHeader.setExpanded(true);
    }
},

// Retrieving Members
// --------------------------------------------------------------------------------------------

//>    @method    layout.getMember()  ([])
//
// Given a numerical index or a member name or member ID, return a pointer to the appropriate member.
// <p>
// If passed a member Canvas, just returns it.
//
//         @param  memberID (string | number | Canvas)   identifier for the required member
//      @return (Canvas)  member widget
//      @see getMemberNumber()
// @visibility external
//<
getMember : function (member) {
    var index = this.getMemberNumber(member);
    if (index == -1) return null;
    return this.members[index];
},

//>    @method    layout.getMemberNumber()  ([])
//
// Given a member Canvas or member ID or name, return the index of that member within this
// layout's members array
// <p>
// If passed a number, just returns it.
//
//         @param  memberID (string | Canvas | number)   identifier for the required member
//      @return (number)    index of the member canvas (or -1 if not found)
//      @see getMember()
// @visibility external
//<
getMemberNumber : function (member) {
    // String: assume global ID of widget
    if (isc.isA.String(member)) {
        var index = this.members.findIndex("name", member);
        if (index != -1) return index;

        member = window[member];
        return this.members.indexOf(member);

    // Widget: check members array
    } else if (isc.isA.Canvas(member)) {
        return this.members.indexOf(member);
    }
    // Number: return unchanged
    if (isc.isA.Number(member)) return member;

    // otherwise invalid
    return -1;
},

//>    @method    layout.hasMember()  ([])
//            Returns true if the layout includes the specified canvas.
//         @param canvas (canvas)  the canvas to check for
//      @return (Boolean)   true if the layout includes the specified canvas
//      @visibility external
//<
hasMember : function (canvas) {
    return this.members.contains(canvas);
},

//>    @method    layout.getMembers()  ([])
// Get the Array of members.<br><br>
//
// NOTE: the returned array should not be modified.
//      @return (Array)   the Array of members
//      @visibility external
//<
getMembers : function (memberNum) {
    return this.members;
},

// Print HTML - ensure we print in member order
getPrintChildren : function () {
    var children = this.members;
    if (!children || children.length == 0) return;
    var printChildren = [];
    for (var i = 0; i < children.length; i++) {
        if (this.shouldPrintChild(children[i])) printChildren.add(children[i]);
    }
    return (printChildren.length > 0) ? printChildren : null;
},

// override getChildPrintHTML to print HLayout members inline
getChildPrintHTML : function (child, printProperties, callback) {
    // respect inline being explicitly set to false;
    if (!printProperties) printProperties = {};
    if (printProperties.inline == null && !this.vertical && !this.printVertical) {
        printProperties.inline = true;
    }
    return this.Super("getChildPrintHTML", [child, printProperties, callback]);
},

// modify the getCompletePrintHTML function to write table-tags around the children HTML if
// appropriate
getCompletePrintHTMLFunction : function (HTML, callback) {
    // The HTML / callback params will be available due to JS closure
    var self = this;
    return function (childrenHTML) {
        self.isPrinting = false;
        var vertical = self.vertical || self.printVertical;
        if (isc.isAn.Array(childrenHTML) && childrenHTML.length > 0) {
            if (vertical) childrenHTML = childrenHTML.join(isc.emptyString);
            else {
                childrenHTML = "<TABLE WIDTH=100%><TR><TD valign=top>" +
                                childrenHTML.join("</TD><TD valign=top>") + "</TD></TR></TABLE>";
            }
        }
        if (childrenHTML) HTML[2] = childrenHTML;
        HTML = HTML.join(isc.emptyString);
        delete self.currentPrintProperties;
        if (callback) {
            self.fireCallback(callback, "html, callback", [HTML, callback]);
            return null;
        } else {
            //self.logWarn("completePrintHTML() - no callback, returning HTML");
            return HTML;
        }
    }
},

// Adding/Removing members
// --------------------------------------------------------------------------------------------

//>    @method    layout.addMember()  ([])
// Add a canvas to the layout, optionally at a specific position.
// <P>
// Depending on the layout policy, adding a new member may cause existing members to
// resize.
// <P>
// When adding a member to a drawn Layout, the layout will not immediately reflow, that is, the
// member will not immediately draw and existing members will not immediately resize.  This is
// to allow multiple new members to be added and multiple manual resizes to take place without
// requiring layout members to redraw and resize multiple times.
// <P>
// To force an immediate reflow in order to, for example, find out what size a newly added
// member has been assigned, call +link{reflowNow()}.
//
// @param newMember (Canvas) the canvas object to be added to the layout
// @param [position] (Integer) the position in the layout to place newMember (starts with 0);
//                            if omitted, it will be added at the last position
// @see addMembers()
// @visibility external
//<
addMember : function (newMember, position, dontAnimate) {
    this.addMembers(newMember, position, dontAnimate);
    return this;
},

//>    @method    layout.addMembers() ([])
// Add one or more canvases to the layout, optionally at a specific position.  See
// +link{addMember()} for details.
//
// @param newMembers (Array of Canvas | Canvas) array of canvases to be added or single Canvas
// @param [position] (Number) position to add newMembers; if omitted newMembers will be added
//                            at the last position
// @visibility external
//<
_singleArray : [],
_$membersAdded : "membersAdded",
addMembers : function (newMembers, position, dontAnimate) {
    if (!newMembers) return;

    if (isc._traceMarkers) arguments.__this = this;

    //>Animation If we're in the process of a drag/drop animation, finish it up before
    // proceeding to remove members
    this._finishDropAnimation(); //<Animation

    if (this.logIsInfoEnabled(this._$layout)) {
        this.logInfo("adding newMembers: " + newMembers +
                     (position != null ? " at position: " + position : ""),
                     "layout");
    }

    if (!isc.isAn.Array(newMembers)) {
        this._singleArray[0] = newMembers;
        newMembers = this._singleArray;
    }

    if (this.members == null) this.members = [];

    // if the position is beyond the end of the layout, clamp it to the last index.
    // This is an incorrect call, but happens easily if the calling code removes members before
    // adding.
    if (position > this.members.length) position = this.members.length;

    var layoutDrawn = this.isDrawn();

    for (var i = 0; i < newMembers.length; i++) {
        var newMember = newMembers[i];

        // support sparse array
        if (!newMember) continue;

        if (!isc.isAn.Instance(newMember)) {
            newMember = this.createCanvas(newMember);
        }
        if (!isc.isA.Canvas(newMember)) {
            this.logWarn("addMembers() unable to resolve member:" + this.echo(newMember) +
                         " to a Canvas - ignoring");
            continue;
        }

        if (this.members.contains(newMember)) {
            // already a member; if a position was specified, move to that position
            if (position != null) {
                this.members.slide(this.members.indexOf(newMember), position+i);
            }
            continue; // but don't do anything else
        }
        // if the new member has snapTo set or is a peer, add it and continue
        if (newMember.addAsPeer || newMember.snapEdge) {
            this.addPeer(newMember, null, false);
            continue;
        } else if (newMember.addAsChild || newMember.snapTo) {
            this.addChild(newMember, null, false);
            continue;
        }
        // really a new member (not just changing positions)

        // deparent the member if it has a parent and clear() it if it's drawn.  This is key to
        // do before we begin resizing the member for this new Layout, otherwise:
        // - the old parent would receive childResized() notifications and may react
        // - if the member was drawn, we would pointlessly resize a DOM representation we are
        //   about to clear()
        if (newMember.parentElement) newMember.deparent();
        if (newMember.isDrawn()) newMember.clear();

        if (position != null) {
            // add the new member
            this.members.addAt(newMember, position+i);
        } else {
            this.members.add(newMember);
        }

        // pick up explicit size specifications, if any
        this._getUserSizes(newMember);

        // set breadth according to sizing policy
        this.autoSetBreadth(newMember);

        //>Animation    If animating we want the member to be hidden so we can do an animateShow()
        // once it's in place
        var shouldAnimateShow = layoutDrawn && this.animateMembers &&
                                !dontAnimate &&
                                newMembers.length == 1 &&
                                newMember.visibility != isc.Canvas.HIDDEN;
        if (shouldAnimateShow) newMember.hide();
        //<Animation

        // add the member as a child or peer, suppressing the behavior of automatically drawing a
        // child or peer as it gets added, because we don't want this member to draw until the
        // sizing policy gets run and gives it a size.
        var drawNow = (layoutDrawn && this.getLengthPolicy() == isc.Layout.NONE);
        if (this.membersAreChildren) {
            this.addChild(newMember, null, drawNow);
        } else {
            this.addPeer(newMember, null, drawNow);
        }

        // move to 0,0 to avoid any getScrollHeight/Width() calls that happen before reflow
        // picking up this newMember at a large left/top coordinate.  In particular this can
        // happen if centering wrt visible breadth.
        newMember.moveTo(0,0);

        // if the user has not specified a tabIndex for the member, slot it into the tab order
        // after the previous canFocus:true member without an explicitly specified tab index.
        //
        // (If the layout is undrawn this will happen in drawMembers() instead)
        if (this.isDrawn()) this.updateMemberTabIndex(newMember);

        // if the member has inherent length, make sure it gets drawn before the policy runs
        if (this.isDrawn() && this.memberHasInherentLength(newMember)) {
            this._moveOffscreen(newMember);
            if (!newMember.isDrawn()) newMember.draw();
        }
    }
    // avoid leaking an added member
    this._singleArray[0] = null;

    //>Animation
    // We're relying on the fact that we have a single member in the array - newMember will
    // always be the member newMembers[0] refers to.
    if (shouldAnimateShow) {
        this._animateMemberShow(newMember);
    } else    //<Animation
        this.reflow(this._$membersAdded);

    // fire _membersChanged()
    this._membersChanged();
},

// pick up explicit size specifications, if any
_getUserSizes : function (newMember) {


    if (newMember._percent_height) {
        newMember._userHeight = newMember._percent_height;
    }
    //else if (newMember._heightSetAfterInit) {
    //    this.logWarn("picked up height for member: " + newMember +
    //                 ", height: " + newMember.getHeight());
    //    newMember._userHeight = newMember.getHeight();
    //}
    if (newMember._percent_width) newMember._userWidth = newMember._percent_width;
    //else if (newMember._widthSetAfterInit) {
    //    this.logWarn("picked up width for member: " + newMember +
    //                 ", width: " + newMember.getWidth());
    //    newMember._userWidth = newMember.getWidth();
    //}


    if (this.memberHasInherentLength(newMember)) {
        if (!newMember._userHeight && !newMember._heightSetAfterInit) {
            //this.logWarn("restoring default height on add");
            newMember.restoreDefaultSize(true);
        }
        if (!newMember._userWidth && !newMember._widthSetAfterInit) {
            //this.logWarn("restoring default width on add");
            newMember.restoreDefaultSize();
        }
    }
},

// to cleanly animate additions and removals of members, we have to animate the membersMargin
// as well
_animateMargin : function (member, added) {
    var layout = this;

    // if the last member is being added or removed, animate the preceding member's margin
    // instead
    var addRemoveMember = member;
    var memberNum = this.getMemberNumber(member);
    if (memberNum == this.members.length-1) member = this.getMember(memberNum-1);
    if (!member) return;

    // when animating simultaneous addition and removal of same-size members (eg D&D reorder),
    // it's important that the Layout not change overall size.  This is only possible if both
    // members have the same size, their animations start simulteanously and fire on the same
    // frame, and have the same accelleration.
    // The first reflow will be triggered by addition/removal of members with the added member
    // at 1px height and the removed member still at full height.
    var margin = this.membersMargin + this.getMemberGap(member);
    if (added) member._internalExtraSpace = -(margin+1);
    //if (added) member._internalExtraSpace = -margin; // alternative margin placement
    //else member._internalExtraSpace = -1;

    this.registerAnimation(
        function (ratio) {
            // round, then subtract to ensure the margin adjustments for simultaneous
            // add/remove add to one whole membersMargin exactly.
            // NOTE: simultaneous show/hide animations will have matching deltas because they
            // apply the same ratio to the same total size difference (fullSize to/from 1px)
            var fraction = Math.floor(ratio * margin);
            if (added) fraction = margin - fraction;

            member._internalExtraSpace = -fraction;
            //isc.Log.logWarn("set extraSpace on member: " + member +
            //                " to: " + member._internalExtraSpace + " on ratio: " + ratio);

            if (ratio == 1) member._internalExtraSpace = null;
        },
        this.animateMemberTime
    );
},

// override removeChild to properly remove children which are also members
removeChild : function (child, name) {

    isc.Canvas._instancePrototype.removeChild.call(this, child, name);
    //this.Super("removeChild", arguments);

    if (this.membersAreChildren && this.members.contains(child)) {
        this.removeMember(child);
    }
},

//>    @method    layout.removeMember()  ([])
// Removes the specified member from the layout.  If it has a resize bar, the bar will be
// destroyed.
//
// @param member (Canvas) the canvas to be removed from the layout
// @visibility external
//<
removeMember : function (member, dontAnimate) {
    this.removeMembers(member, dontAnimate);
},


//>    @method    layout.removeMembers()  ([])
//
//  Removes the specified members from the layout. If any of the removed members have resize
//  bars, the bars will be destroyed.
//
//     @param members (Array of Canvas | Canvas) array of members to be removed, or single member
//    @visibility external
//<
removeMembers : function (members, dontAnimate) {
    if (!members) return;

    //>Animation If we're in the process of a drag/drop animation, finish it up before
    // proceeding to remove members
    this._finishDropAnimation(); //<Animation

    if (!isc.isAn.Array(members)) {
        this._singleArray[0] = members;
        members = this._singleArray;
    }
    // if we were passed our own members array, copy it, because otherwise we'll get confused
    // when iterating through it, and simultaneously removing members from it!
    if (members === this.members) members = members.duplicate();

    // Resolve all member IDs to actual members
    // Note: do this before we start removing members, so if we're passed an index, the removal
    // of other members won't modify it.
    for (var i = 0; i < members.length; i++) {
        var memberId = members[i];
        if (isc.isA.Canvas(animatingMember)) continue;
        members[i] = this.getMember(memberId);
        if (members[i] == null) {
            this.logWarn("couldn't find member to remove: " + this.echoLeaf(memberId));
            members.removeAt(i);
            i -=1;
        }
    }

    //>Animation
    // If we have a single member, and we're animating member change, animate hide() it before
    // removing it.
    var shouldAnimate = (this.animateMembers && members.length == 1 && !dontAnimate),
        animatingMember = (shouldAnimate ? members[0] : null);

    if (shouldAnimate) {
        // don't try to animate something deparenting or destroying, or invisible
        if (animatingMember.parentElement != this ||
            animatingMember.destroying || !animatingMember.isVisible())
        {
            shouldAnimate = false;
        }
    }
    if (shouldAnimate) {
        // NOTE: copy the Array of members to remove to avoid changes during the animation.
        // Note this avoids changes to the passed in Array as well as incorrect reuse of the
        // singleton this._singleArray during the animation.
        var layout = this,
            removeMembers = members.duplicate(),
            callback = function () { layout._completeRemoveMembers(removeMembers); };
        this._animateMemberHide(animatingMember, callback);
    // If we're not animating fall through to _completeRemoveMembers() synchronously
    } else {
    //<Animation

        this._completeRemoveMembers(members);
    //>Animation
    }   //<Animation

    // clear the singleton Array
    this._singleArray[0] = null;
    // fire _membersChanged()
    this._membersChanged();
},

// internal method fired to complete removing members
_$membersRemoved : "membersRemoved",
_completeRemoveMembers : function (members) {
    if (!members) return;

    for (var i = 0; i < members.length; i++) {
        var member = members[i];
        this.members.remove(member);

        // NOTE: the member.parentElement check avoids a loop when removeMembers is called from
        // removeChild
        if (this.membersAreChildren && member.parentElement == this) member.deparent();

        member._heightSetAfterInit = member._widthSetAfterInit = null;

        // if we created a resizeBar for this member, destroy it
        if (member._resizeBar) {
            member._resizeBar.destroy();
            member._resizeBar = null;
        }
        // the member should no longer show us when it gets shown
        if (member.showTarget == this) delete member.showTarget;

        if (member._isPlaceHolder) member.destroy();
    }

    this.reflow(this._$membersRemoved);
},

//> @method layout.setMembers()
// Display a new set of members in this layout. Equivalent to calling removeMembers() then
// addMembers(). Note that the new members may include members already present, in which case
// they will be reordered / integrated with any other new members passed into this method.
// @param members (Array of Canvas)
// @visibility external
//<
setMembers : function (members) {
    if (members == this.members || !isc.isAn.Array(members)) return;
    var removeMembers = [];
    for (var i = 0; i < this.members.length; i++) {
        if (!members.contains(this.members[i])) removeMembers.add(this.members[i]);
    }
    var instantRelayout = this.instantRelayout;
    this.instantRelayout = false;
    this.removeMembers(removeMembers, true);
    // Note members may contain some members we already have (and shuffle order etc)
    // addMembers should handle this.

    this.addMembers(members, 0, true);
    this.instantRelayout = instantRelayout;
    if (instantRelayout) this.reflow("set members");

},


// Methods to show/hide members, with animation if appropraite

//> @method layout.showMember()
// Show the specified member, firing the specified callback when the show is complete.
// <P>
// Members can always be directly shown via <code>member.show()</code>, but if
// +link{animateMembers,animation} is enabled, animation will only occur if showMember() is
// called to show the member.
//
// @param member (Canvas) Member to show
// @param callback (Callback) action to fire when the member has been shown
// @visibility external
//<
showMember : function (member, callback) {
    return this.showMembers([member], callback);
},

//> @method layout.showMembers()
// Show the specified array of members, and then fire the callback passed in.
// @param Array (members) Members to show
// @param callback (callback) action to fire when the members are showing.
//<
//>Animation  If <code>this.animateMembers</code> is true, the show will be performed as an
// animation in the case where a single, animate clip-able member was passed.   //<Animation
showMembers : function (members, callback) {

    //>Animation
    if (this.isDrawn() && this.animateMembers && members.length == 1) {
        this._animateMemberShow(members[0], callback);
    } else {    //<Animation
        for (var i = 0; i < members.length; i++) {
            var member = this.getMember(members[i]);
            member.show();
        }
        if (callback) this.fireCallback(callback);
    //>Animation
    }   //<Animation

},

// shared between showMembers and addMembers
_animateMemberShow : function (member, callback) {
    member = this.getMember(member);
    this.setNewMemberLength(member);
    member.animateShow(this.animateMemberEffect, callback, this.animateMemberTime);
    if (member.isAnimating()) this._animateMargin(member, true);
},


setNewMemberLength : function (newMember) {
    // resize the new member to the desired size
    newMember._prefetchingSize = true;
    var sizes = this._getMemberSizes(this.getTotalMemberSpace());
    delete newMember._prefetchingSize;
    var size = sizes[this.members.indexOf(newMember)];

    // apply the height; avoid it being regarded as a new user size
    var oldSetting = this._layoutInProgress;
    this._layoutInProgress = true;

    this.vertical ? newMember.setHeight(size) : newMember.setWidth(size);
    this._layoutInProgress = oldSetting;

},

//> @method layout.hideMember()
// Hide the specified member, firing the specified callback when the hide is complete.
// <P>
// Members can always be directly hidden via <code>member.hide()</code>, but if
// +link{animateMembers,animation} is enabled, animation will only occur if hideMember() is
// called to hide the member.
//
// @param member (Canvas) Member to hide
// @param callback (Callback) callback to fire when the member is hidden.
// @visibility external
//<
hideMember : function (member, callback) {
    return this.hideMembers([member], callback);
},

//> @method layout.hideMembers()
// Hide the specified array of members, and then fire the callback passed in.
// @param Array (members) Members to hide
// @param callback (callback) action to fire when the members are hidden.
//<
//>Animation  If <code>this.animateMembers</code> is true, the hide will be performed as an
// animation in the case where a single, animate clip-able member was passed.   //<Animation
hideMembers : function (members, callback) {
    this._hideMembersCallback = callback;
    //>Animation
    if (this.animateMembers && members.length == 1) {
        this._animateMemberHide(members[0], callback);
    } else {//<Animation
        for (var i = 0; i < members.length; i++) {
            var member = this.getMember(members[i]);
            member.hide();
        }
        this.fireCallback(callback);
    //>Animation
    } //<Animation
},


// shared between hideMembers and removeMembers
_animateMemberHide : function (member, callback) {
    // resolve index to actual member
    member = this.getMember(member);
    member.animateHide(this.animateMemberEffect, callback, this.animateMemberTime);
    if (member.isAnimating()) this._animateMargin(member);
},

//> @method layout.setVisibleMember()
// Hide all other members and make the single parameter member visible.
//
// @param member (Canvas) member to show
//
// @visibility external
//<
setVisibleMember : function (member) {
    var theMem = this.getMember(member);
    if (theMem == null) return;
    this.hideMembers(this.members);
    this.showMember(theMem);
},

// Reordering Members
// --------------------------------------------------------------------------------------------

//>    @method    layout.reorderMember()  ([])
// Shift a member of the layout to a new position
//
// @param memberNum   (number)  current position of the member to move to a new position
// @param newPosition (number)  new position to move the member to
//
// @visibility external
//<
reorderMember : function (memberNum, newPosition) {
    this.reorderMembers(memberNum, memberNum+1, newPosition)
},

//>    @method    layout.reorderMembers()  ([])
// Move a range of members to a new position
//
// @param start       (number)  beginning of range of members to move
// @param end         (number)  end of range of members to move, non-inclusive
// @param newPosition (number)  new position to move the members to
//
// @visibility external
//<
reorderMembers : function (start, end, newPosition) {
    this.members.slideRange(start, end, newPosition);
    this._membersReordered("membersReordered");
},

// Helper method to update the UI after the members array has been reworked.

_membersReordered : function (reason) {
    this.layoutChildren(reason);
     // fire _membersChanged()
    this._membersChanged();
},

// replace one member with another, without an intervening relayout, and without animation
replaceMember : function (oldMember, newMember) {
    var oldSetting = this.instantRelayout;
    this.instantRelayout = false;
    var oldMemberPos = this.getMemberNumber(oldMember);
    if (oldMemberPos < 0) {
        this.logWarn("replaceMember(): " + oldMember.getID() + " is not a member");
        oldMemberPos = 0;
    } else {
        this.removeMember(oldMember, true);
    }
    this.addMember(newMember, oldMemberPos, true);
    this.instantRelayout = oldSetting;
    if (oldSetting) this.reflowNow();
},

//> @method layout.membersChanged()
// Fires once at initialization if the layout has any initial members, and then fires whenever
// members are added, removed or reordered.
//
// @visibility external
//<

// internal membersChanged
_membersChanged : function () {
    if (!this.destroying) { // skip if happening during destroy()
        this._computeShowResizeBarsForMembers();
    }

    // fire membersChanged event
    if (this.membersChanged) this.membersChanged();
},

// We keep track of whether the resizeBar should actually be shown in _computedShowResizeBar
// because it depends on showResizeBar, defaultResizeBars and the position of the member
// within the layout. By caching the computed value, we can keep track of changes without
// interfering with the desired setting in showResizeBar itself.
_computeShowResizeBarsForMembers : function () {
    var defResize = this.defaultResizeBars;
    for (var i = this.members.length - 1; i >= 0; i--) {
        var member = this.members[i];
        // handle sparse array
        if (member == null) continue;
        var showResize = false; // Covers defResize == isc.Canvas.NONE
        if (defResize == isc.Canvas.MARKED) {
            showResize = member.showResizeBar;
        } else if (defResize == isc.Canvas.MIDDLE) {
            // Note that we need the explicit comparison to false here and below due to the
            // semantics of defaultResizeBars
            showResize = (i < this.members.length - 1) && (member.showResizeBar != false);
        } else if (defResize == isc.Canvas.ALL) {
            showResize = member.showResizeBar != false;
        }
        if (this.neverShowResizeBars) {
            showResize = false;
        }

        var currentComputedResizeBar = member._computedShowResizeBar;
        member._computedShowResizeBar = showResize;
        if (currentComputedResizeBar != showResize) this.reflow("_computedShowResizeBar changed");
    }
},

// Tabbing
// --------------------------------------------------------------------------------------------


updateMemberTabIndex : function (newMember) {

    // Note: if the member is not focusable, but has children we still want to
    // call setTabBefore/after to update the childrens' tab indices
    if (!this._memberCanFocus(newMember)
        || (newMember.tabIndex != null && !newMember._autoTabIndex)) return;

    var previousMember,
        position = this.members.indexOf(newMember);

    // find the previous member without a user-specified tab index by iterating up the members
    // array

    while (position > 0 && previousMember == null) {
        position -= 1
        previousMember = this.members[position]._getLastAutoIndexDescendant();
    }

    // if we didn't find a previous focusable member, slot the new member into the tab
    // order after the layout itself.
    if (previousMember == null && (this.tabIndex == null || this._autoTabIndex))
        previousMember = this;

    // Note: if we didn't find a 'previousMember', it implies this Layout is not included in
    // the page's tab order. Allow normal tabIndex management to position our first
    // auto-tab member at the end of the page's tab order, then we'll slot subsequent members
    // after it.
    if (previousMember) {
        // Put this child into the tab-order for the page after the previous member with an
        // auto-allocated tab index.
        // Note: this will no-op if this widget already follows the previousMember in the tab-order
        //this.logWarn("slotting member:"+ newMember + " after:"+ previousMember);
        newMember._setTabAfter(previousMember);
    }

},

// Dragging members out
// --------------------------------------------------------------------------------------------

// if a member is dragged with "target" dragAppearance, put a placeholder into the layout to
// prevent reflow and restacking during the drag

//> @attr layout.placeHolderDefaults (canvas properties: {...} : IR)
// If +link{layout.showDragPlaceHolder, this.showDragPlaceHolder} is true, this
// defaults object determines the default appearance of the placeholder displayed
// when the user drags a widget out of this layout.<br>
// Default value for this property sets the placeholder +link{canvas.styleName, styleName} to
// <code>"layoutPlaceHolder"</code><br>
// To modify this object, use +link{Class.changeDefaults()}
// @group dragdrop
// @visibility external
//<
placeHolderDefaults : {
    styleName:"layoutPlaceHolder",
    overflow:isc.Canvas.HIDDEN
},
dragRepositionStart : function () {

    var dragTarget = isc.EH.dragTarget;

    // only take over the drag interaction if an immediate member is being dragged with target
    // drag animation.
    if (!this.hasMember(dragTarget) || dragTarget.getDragAppearance(isc.EH.DRAG_REPOSITION) != "target") return;

    // record page-level coordinates before reparent
    var left = dragTarget.getPageLeft(),
        top = dragTarget.getPageTop();

    this._popOutDraggingMember(dragTarget, left, top);
},

// This helper method is called when dragging a member out of a layout.
// It will deparent the member and move it to the appropriate position (so it can be dragged
// and/or animated around outside the parent).
// It also adds a spacer to the layout where the member was taken from so we don't get an
// unexpected reflow.

_popOutDraggingMember : function (member, left, top) {

    this._draggingMember = member;

    // make a visible placeHolder if showDragPlaceHolder is set
    var placeHolder = this._createSpacer(member, "_dragOutPlaceHolder", this.showDragPlaceHolder)
    member._dragPlaceHolder = placeHolder;

    // prevent relayout while we deparent and swap a placeholder in.  Also, prevent
    // animation of the placeholder we add
    var oldSetting = this.instantRelayout;
    this.instantRelayout = false;


    this._doPopOutDragMember(placeHolder, member);

    // deparent, but keep us in the event processing chain by setting eventParent
    member.deparent();
    member.eventParent = this;

    this.instantRelayout = oldSetting;

    member.moveTo(left,top);
    member.draw();
},

_doPopOutDragMember : function (placeHolder, member) {
    this.addMember(placeHolder, this.getMemberNumber(member), true);
},

// dragRepositionStop will be bubbled up to the Layout from drag-repositoned members.
// The only supported drag reposition of members is drag reordering / dragging out to
// another layout.  We override this method to
// - suppress the default EventHandler behavior for members (which will directly call 'moveTo()'
//   on the dragTarget in some cases).

// - If dragAppearance on the member being dragged is "Target", on dragRepositionStart() we
//   removed the member from the Layout and put a placeholder in instead.
//   - if a successful drop occurred on this or another layout, that method takes care of
//     removing this placeholder
//   - otherwise remove the placeholder here, and if no drop occurred, put the widget back
//     into our members' array

dragRepositionStop : function () {

    var dragTarget = isc.EH.dragTarget;

    // We may be getting this event bubbled up from a child of a member.
    // in this case allow normal drag repo behavior on the target

    if (!this.members.contains(dragTarget) && dragTarget != this._draggingMember) return;

    // In this case we were drag repositioning a member.
    var appearance = dragTarget.getDragAppearance(isc.EH.DRAG_REPOSITION),
        isTarget = appearance == isc.EH.TARGET;
    // If the appearance is neither OUTLINE nor TARGET - just kill the event
    if (!isTarget && (appearance != isc.EH.OUTLINE)) return false;

    // Default EH.dragRepositionStop() behavior:
    // - if dragAppearance is target, and target.dragRepositionStop() returns false, call
    //   'moveTo' to reset the position of the member to whatever it was before dragging started
    // - if dragAppearance is outline or tracker, and target.dragRepositionStop() does not
    //   return false, call 'moveTo' on the target to move it to the drop position.
    // To suppress both these behaviors we therefore return false if dragAppearance is outline,
    // or STOP_BUBBLING if dragAppearance is target.
    var returnVal = isTarget ? isc.EH.STOP_BUBBLING : false;

    // Clear out the draggingMember
    this._draggingMember = null;
    // no longer act as the event parent
    if (dragTarget.eventParent == this) dragTarget.eventParent = null;

    // If we set up a placeHolder in the dragTarget on dragRepositionStart() we may need to clear
    // it now

    if (dragTarget.dropSucceeded) return returnVal;

    var placeHolder = dragTarget._dragPlaceHolder;
    if (placeHolder != null) {

        // If the member has been reparented or destroyed, it's no longer under our management.
        // Simply remove the placeholder.
        if (dragTarget.parentElement != null || dragTarget.destroyed) {
            this._cleanUpPlaceHolder(dragTarget);

        // otherwise, drop failed, put member back into layout at placeholder

        } else {
            // clear the pointer to the placeholder
            dragTarget._dragPlaceHolder = null;

            var oldPosition = this.getMemberNumber(placeHolder),
                oldRect = placeHolder.getPageRect(),

                layout = this,
                replaceMember = function () {
                    if (dragTarget._canDrag != null) {
                        dragTarget.canDrag = dragTarget._canDrag;
                        delete dragTarget._canDrag;
                    }
                    if (dragTarget._canDragReposition != null) {
                        dragTarget.canDragReposition = dragTarget._canDragReposition;
                        delete dragTarget._canDragReposition;
                    }
                    layout.replaceMember(placeHolder, dragTarget);
                }
            ;

            //>Animation
            // do this via an animation if we are animating member changes
            if (this.animateMembers) {
                // prevent more drags from being initiated on the dragTarget while
                // its animating back to its placeholder position
                dragTarget._canDrag = dragTarget.canDrag;
                dragTarget.canDrag = false;

                dragTarget._canDragReposition = dragTarget.canDragReposition;
                dragTarget.canDragReposition = false;

                dragTarget.animateRect(oldRect[0], oldRect[1], oldRect[2], oldRect[3],
                                       replaceMember);
            } else
            //<Animation
                replaceMember(true);
        }
    }
    return returnVal;
},

_createSpacer : function (member, suffix, visible) {
    var spacer, props;


    if (visible) {
        spacer = this.createAutoChild("placeHolder", props, isc.Canvas);
    } else {
        spacer = isc.LayoutSpacer.create(props);
    }
    spacer.setRect(member.getRect());

    // HACK: since the spacer gets sized outside of the Layout, if we don't do this, the Layout
    // will resize the spacer when it's added
    spacer._userWidth = spacer.getWidth();
    spacer._userHeight = spacer.getHeight();

    spacer.layoutAlign = member.layoutAlign;

    // Ignore *both*:
    // - memberOverlap (it's already included with the margin of the moved item)
    // - _internalExtraSpace (spacer is placed on fixed locations in the layout)
    spacer.extraSpace = (member.extraSpace || 0);

    spacer._isPlaceHolder = true; // HACK see addMember()

    return spacer;
},

// Helper method to remove the placeHolder set up when a member gets dragged out of this Layout
removePlaceHolder : function (placeHolder) {
    // if the placeHolder wasn't a LayoutSpacer, ie it was something visible, and we're going
    // to animate it's remove, switch to an invisible placeHolder for the animation (the idea
    // is that the placeHolder stands in for the member, and the member isn't actually
    // shrinking)
    if (this.animateMembers && !isc.isA.LayoutSpacer(placeHolder)) {
        var newPlaceHolder = this._createSpacer(placeHolder);
        this.replaceMember(placeHolder, newPlaceHolder);
        placeHolder.destroy();
        placeHolder = newPlaceHolder;
    }
    // this will animate if enabled.  When the remove is complete, the placeholder will also be
    // destroyed
    this.removeMember(placeHolder);
},


// Dropping members in
// --------------------------------------------------------------------------------------------

willAcceptDrop : function () {
    if (!this.canDropComponents) {
        return this.canAcceptDrop == null ? false : this.canAcceptDrop;
    } else if (!this.canAcceptDrop) return false;
    return this.invokeSuper(isc.Layout, "willAcceptDrop");
},

// create and place the dropLine
dropOver : function () {
    // note: allow bubbling
    if (!this.willAcceptDrop()) return;
    this.showDropLine();

    isc.EventHandler.dragTarget.bringToFront();
    return true;
},

// place the dropLine
dropMove : function () {
    if (!this.willAcceptDrop()) return;
    this.showDropLine();
},

dropOut : function () { this.hideDropLine(); },

dropStop : function () { this.hideDropLine(); },

//> @method layout.getDropComponent()
// When +link{canDropComponents} is true, this method will be called when a component is
// dropped onto the layout to determine what component to add as a new layout member.
// <P>
// By default, the actual component being dragged (isc.EventHandler.getDragTarget()) will be
// added to the layout.  For a different behavior, such as wrapping dropped components in
// Windows, or creating components on the fly from dropped data, override this method.
// <P>
// You can also return null to cancel the drop.
//
// @param dragTarget (Canvas) current drag target
// @param dropPosition (int) index of the drop in the list of current members
// @return (Canvas) the component to add to the layout, or null to cancel the drop
//
// @visibility external
//<
getDropComponent : function (dragTarget, dropPosition) {

    // portlet moved
    if (!isc.isA.Palette(dragTarget)) return dragTarget;

    // other, drag and drop from palette, create new portlet
    var data = dragTarget.transferDragData(),
        component = (isc.isAn.Array(data) ? data[0] : data);

    return component.liveObject;
},

//>    @method    layout.drop() (A)
// Layouts have built-in handling of component drag and drop.  See the discussion in
// +link{Layout} on how it works.  If you override this builtin implementation of drop() and
// you're using the built-in dropLine via +link{Layout.canDropComponents}:true, be sure to call
// +link{Layout.hideDropLine()} to hide the dropLine after doing your custom drop() handling.
//
// @return (boolean) Returning false will cancel the drop entirely
// @visibility external
//<
drop : function () {
    if (!this.willAcceptDrop() || this._suppressLayoutDrag) return;

    var dropPosition = this.getDropPosition();
    var newMember = this.getDropComponent(isc.EventHandler.getDragTarget(), dropPosition);
    // allow cancelation of the drop from getDropComponent
    if (!newMember) return;
    // If we contain the member (or its placeholder) and the new position matches the old one
    // we can just bail since there will be no movement
    var newMemberIndex = this.members.indexOf(newMember);
    if (newMemberIndex == -1 && newMember._dragPlaceHolder)
        newMemberIndex = this.members.indexOf(newMember._dragPlaceHolder)
    if (newMemberIndex != -1 &&
        (newMemberIndex == dropPosition || newMemberIndex + 1== dropPosition))
    {
        return false;
    }


    newMember.dropSucceeded = true;


    if (isc.Browser.isMoz) {
        this.delayCall("_completeDrop", [newMember, dropPosition]);
    } else {
        this._completeDrop(newMember, dropPosition);
    }
    return isc.EH.STOP_BUBBLING;
},

// Helper to complete a drop operation
_completeDrop : function (newMember, dropPosition) {

    this.hideDropLine();

    //>Animation

    var memberParent = newMember.parentElement;
    if (memberParent && newMember.getDragAppearance(isc.EH.dragOperation) == isc.EH.OUTLINE &&
        this.animateMembers && isc.isA.Layout(memberParent) &&
        memberParent.hasMember(newMember))
    {
        memberParent._popOutDraggingMember(newMember, isc.EH.dragOutline.getPageLeft(),
                                            isc.EH.dragOutline.getPageTop());
    }
    //<Animation

    // if this member was really reordered (dragged from this same layout), it's new position
    // is one less if it was dropped past it's old position
    var dropAfterSelf = false;
    // Because we deparent a member that has dragAppearance:"target" or that will animate into
    // place, this will only occur if:
    // - reordering something with dragAppearance 'tracker'
    // - reordering something with dragAppearance 'outline' if we're not animating into place
    if (this.members.contains(newMember)) {
        var memberPos = this.members.indexOf(newMember);

        if (memberPos < dropPosition) dropAfterSelf = true;
        this.removeMember(newMember, true);

    // If we don't contain the member:
    // - the member currently resides in another layout (will get pulled out when we do
    //   addMember())
    // - there is a placeHolder wherever the member was (could be in this layout or
    //   another layout)
    // Handle Drag target or outline / drag reposition case (placeholder is in the members array)
    } else {

        var placeHolder = newMember._dragPlaceHolder;
        if (placeHolder != null) {
            var placeHolderIndex = this.getMemberNumber(placeHolder)
            if ((placeHolderIndex >= 0) && (placeHolderIndex < dropPosition)) {
                dropAfterSelf = true;
            }
            placeHolder.parentElement._cleanUpPlaceHolder(newMember);
        }
    }

    // if we're dropping a member after itself (reorder), the insertionPosition is reduced by
    // one (assuming the member is removed before being re-added)
    var insertionPosition = dropPosition - (dropAfterSelf ? 1 : 0);

    //>Animation
    // If we're doing a drag-reposition of the new member with dragAppearance 'target' our
    // outline, and animateMembers is true, we want to animate the new member into place
    // by moving it from the drop position to the final position in the layout.
    // If the drag-appearance is tracker it's not clear what an appropriate animation
    // would be - we could have the dragged widget float from either it's current position or
    // from the drag-outline position into the slot, but just have it do the normal 'addMember'
    // animation for now.
    if (!this.animateMembers ||
        (newMember.dragAppearance != "target" && newMember.dragAppearance != "outline" )) {
    //<Animation
        this.addMember(newMember, insertionPosition);
        // Clear the dropSucceeded method so it doesn't effect subsequent drag-reorderings
        delete newMember.dropSucceeded;
        return;
    //>Animation
    }


    // make a spacer to take the place of the member while we animate it into place.  Note that
    // we will automatically animateShow() on this spacer so the amount of space will grow as
    // the member moves towards it.
    // NOTE: the prospective member may be resized on the width axis when finally added to the
    // Layout, which could cause the member to be extended on the length axis.  Changing the
    // member's size before starting the move animation would be odd looking, so we instead
    // live with the possibility of other members being pushed down at the end of the
    // animation.  The only other alternative would be to resize the member to the Layout's
    // breadth, redraw if necessary to check the extents, and resize back, which would probably
    // be too slow even if we could avoid flashing.
    var spacer = this._createSpacer(newMember, "_slideInTarget");
    this.addMember(spacer, dropPosition); // automatically animates, pushing other members down

    this.reflowNow();

    //this.logWarn("hDistance: " + hDistance + ", vDistance: " + vDistance +
    //             ", distance: " + distance);
    // Hang onto a pointer to the member being animated so we can finish this animation early
    // if required.
    this._animatingDrag = newMember;

    var layout = this,
        targetLeft = spacer.getPageLeft(),
        targetTop = spacer.getPageTop();

    if (dropAfterSelf) {
        // shift the target position by the amount of space the reordered member is vacating.
        // NOTE: if being dropped in the last position, the margin due to this member
        // disappears
        var margin = this.membersMargin + this.getMemberGap(newMember);
        if (this.vertical) targetTop -= (newMember.getVisibleHeight() + margin);
        else targetLeft -= (newMember.getVisibleWidth() + margin);
    }

    // XXX HACK very special case for margin animation
    // When we add a member we use _internalExtraSpace to animate the addition of it's
    // margin as well.  In every case but adding in the last position, the animated
    // margin is the margin *after* the added member (the spacer), and hence wouldn't
    // affect positioning.  But for the case of adding at the end, we have to compensate
    // for the fact that the second to last member has _internalExtraSpace set,
    // representing a temporary reduction in margin that affects the spacer placement right
    // now but won't be there when the animation completes
    if (spacer == this.members.last() && this.members.length > 1) {
        var internalSpace = (this.members[this.members.length-2]._internalExtraSpace || 0);
        //this.logWarn("internalSpace: " + internalSpace);
        if (this.vertical) targetTop -= internalSpace;
        else targetLeft -= internalSpace;
    }
    newMember.animateMove(
        targetLeft, targetTop,
        function () {
            // clear the flag that indicates we're in mid-drag
            layout._animatingDrag = null;

            // suppress instantRelayout while destroying the placeholder to avoid restack
            // before we add the new member
            var oldSetting = layout.instantRelayout;
            layout.instantRelayout = false;
            spacer.destroy();
            newMember.dropSucceeded = null;
            layout.addMember(newMember, insertionPosition, true);
            layout.instantRelayout = oldSetting;
            if (oldSetting) layout.reflowNow();
        },
        this.animateMemberTime
    );
    //<Animation
},


_cleanUpPlaceHolder : function (newMember) {

    var placeHolder = newMember._dragPlaceHolder;

    if (this.hasMember(placeHolder)) {
        newMember._dragPlaceHolder = null;
        this.removePlaceHolder(placeHolder)
   }
},

//>Animation Helper method to finish up a drag/drop animation if one is currently in progress.
_finishDropAnimation : function () {

    if (this._animatingDrag != null) {
        this._animatingDrag.finishAnimation("move");
    }
},
//<Animation

//>    @method    layout.getDropPosition() (A)
//
// Get the position a new member would be dropped.  This drop position switches in the
// middle of each member, and both edges (before beginning, after end) are legal drop positions
// <p>
// Use this method to obtain the drop position for e.g. a custom drop handler.
//
// @return (int) the position a new member would be dropped
//
// @visibility external
//<
getDropPosition : function () {
    var coord = this.vertical ? this.getOffsetY() : this.getOffsetX();

    // before beginning
    if (coord < 0) return 0;

    var totalSize = this.vertical ? this._topMargin : this._leftMargin;
    for (var i = 0; i < this.memberSizes.length; i++) {
        var size = this.memberSizes[i],
            member = this.members[i];
        if (!member) continue;
        if (coord < (totalSize + (size/2))) {
            // respect an explicit canDropBefore setting, which prevents dropping before a
            // member
            if (member.canDropBefore === false) return false;
            return i;
        }
        totalSize += size + this.membersMargin + this.getMemberGap(member);
    }
    // last position: past halfway mark on last member
    return this.members.length;
},

// Drop line
// --------------------------------------------------------------------------------------------

_getChildInset : function (topEdge) {
    return (topEdge ? this.getTopMargin() + this.getTopBorderSize() :
                      this.getLeftMargin() + this.getLeftBorderSize())
},

getPositionOffset : function (position) {
    if (this.members.length == 0) {
        // empty layout
        return this.vertical ? this.getPageTop() + this._getChildInset(true) + this._topMargin :
                               this.getPageLeft() + this._getChildInset() + this._leftMargin;
    }
    if (position < this.members.length) {
        // get near side of member
        var member = this.members[position];

        return (this.vertical ? member.getPageTop() : member.getPageLeft());
    } else {
        // last position: get far side of last member (not end of Layout, since Layout may be
        // larger than last member)
        var member = this.members[position - 1];
        return (this.vertical ? member.getPageBottom() : member.getPageRight());
    }
},

// show a drop line in the middle of the margin at that drop position
showDropLine : function () {

    if (this._suppressLayoutDrag) return;

    if (this.showDropLines == false) {
        // just bail
        return;
    }

    var position = this.getDropPosition();
    if (!isc.isA.Number(position)) {
        this.hideDropLine();
        return;
    }

    // before or after list
    if (position < 0) return;


    if (this._layoutIsDirty) this.reflowNow();

    if (!this._dropLine) this._dropLine = this.makeDropLine();

    var thickness = this.dropLineThickness,
        lengthOffset = this.getPositionOffset(position);

    // place the dropLine in the middle of the margin between members, or in the middle of the
    // layoutMargin at the ends of the layout
    // note use _leftMargin / _rightMargin rather than this.layoutMargin. Handles
    // explicit layoutLeftMargin or paddingAsLayoutMargin as well as explicit layoutMargin.
    var margin;
    // this is just a sanity check - the widget should be drawn at this point so we'd expect
    // the layout margins to have been set up already
    if (this._leftMargin == null) this.setLayoutMargin();

    if (position == 0) {
        margin = this.vertical ? this._topMargin : this._leftMargin;
    } else if (position == this.members.length) {
        // when placing at the end, add to the offset instead of subtracting
        margin = - (this.vertical ? this._bottomMargin : this._rightMargin);
    } else {
        margin = this.membersMargin;
    }
    lengthOffset = lengthOffset - Math.round((margin+thickness)/2);

    var breadthOffset = this.vertical ?
            this._leftMargin + this._getChildInset() :
            this._topMargin + this._getChildInset(true);

    var breadth = this.vertical ?
        this.getVisibleWidth() - this.getVMarginBorder() - this._getBreadthMargin() :
        this.getVisibleHeight() - this.getHMarginBorder() - this._getLengthMargin();

    // "breadth" was being used for the height of the dropLine in an HLayout in the
    // setPageRect() below, but includes inappropriate margins. Calculating the proper height
    // separately to avoid the risk of breaking something else
    var height = breadth + this._getLengthMargin();

    this._dropLine.setPageRect(
        (this.vertical ? this.getPageLeft() + breadthOffset : lengthOffset),
        (this.vertical ? lengthOffset : this.getPageTop() + breadthOffset),
        (this.vertical ? breadth : thickness),
        (this.vertical ? thickness : height)
    );

    var topParent = this.topElement || this;
    if (this._dropLine.getZIndex() < topParent.getZIndex()) this._dropLine.moveAbove(topParent);

    //this.logWarn("showDropLine, relative top of layout: " +
    //             (this.getPageTop() - this._dropLine.getPageTop()) + " for pos: " + position);
    this._dropLine.show();
},


//>    @method    layout.hideDropLine() (A)
// Calling this method hides the dropLine shown during a drag and drop interaction with a
// Layout that has +link{Layout.canDropComponents} set to true.  This method is only useful for
// custom implementations of +link{Layout.drop()} as the default implementation calls this
// method automatically.
//
// @visibility external
//<
hideDropLine : function () {
    if (this._dropLine) this._dropLine.hide();
},

//> @attr layout.dropLine (AutoChild Canvas : null : R)
// Line showed to mark the drop position when components are being dragged onto this Layout.
// A simple Canvas typically styled via CSS.  The default dropLine.styleName is
// "layoutDropLine".
// @visibility external
// @example dragMove
//<

dropLineDefaults : {
    styleName:"layoutDropLine",
    overflow:"hidden",
    isMouseTransparent:true // to prevent dropline occlusion of drop events
},
makeDropLine : function () {
    var dropLine = this.createAutoChild("dropLine", null, isc.Canvas);
    dropLine.dropTarget = this; // delegate dropTarget
    return dropLine;
},

// ResizeBar handling
// --------------------------------------------------------------------------------------------

createResizeBar : function (member, position, targetAfter, hideTarget) {
    var bar = isc.ClassFactory.getClass(this.resizeBarClass).createRaw();
    bar.autoDraw = false;
    bar.target = member;
    bar.targetAfter = targetAfter;
    bar.hideTarget = hideTarget;
    bar.layout = this;
    bar.vertical = !this.vertical;
    bar.dragScrollDirection = this.vertical ? isc.Canvas.VERTICAL : isc.Canvas.HORIZONTAL;
    bar.dragScrollType = "parentsOnly";
    bar.init();

    return isc.SGWTFactory.extractFromConfigBlock(bar);
},

makeResizeBar : function (member, offset, position, length) {

    // create a resizerBar for this member
    var bar = member._resizeBar;
    if (bar == null) {
        var target = member,
            targetAfter,
            hideTarget,
            nextMember = this.getMember(this.getMemberNumber(member)+1) || member;

        if (member.resizeBarTarget == "next") {
            target = nextMember;
            targetAfter = true;
        }

        // by default a resizeBar will target the same member for both resizing and hiding.
        // This flag allows us to resize one member but hide another.  Not documented until we
        // see an actual request for this; just covering all the cases

        if (member.resizeBarHideTarget != null) {
            if (member.resizeBarHideTarget == "next") hideTarget = nextMember;
            else hideTarget = member;
        } else {
            hideTarget = target;
        }

        bar = this.createResizeBar(target, position, targetAfter, hideTarget);
        member._resizeBar = bar;
    }

    // for handling resizeBar joints in nested layouts
    //this._handleJoints(bar);
    // position bar as top-level widget
    //offset += (this.vertical ? this.getPageLeft() : this.getPageTop());
    //position += (this.vertical ? this.getPageTop() : this.getPageLeft());

    // place the bar after the member
    if (this.vertical) {
        bar.setRect(offset, position,
                    length, this.resizeBarSize);
    } else {
        if (this.isRTL()) position -= this.resizeBarSize;
        bar.setRect(position, offset,
                    this.resizeBarSize, length);
    }
    // add the bar as a child/peer (will no-op second time around)
    if (this.membersAreChildren) {
        this.addChild(bar);
    } else {
        this.addPeer(bar);
    }

    // draw the bar (this won't happen automatically)
    if (!bar.isDrawn()) bar.draw();
    // May have been hidden by a previous stackMembers call
    if (!bar.isVisible()) bar.show();
    return bar;
},




propertyChanged : function (propertyName, value) {
    this.invokeSuper(isc.Layout, "propertyChanged", propertyName, value);
    if (isc.endsWith(propertyName, "Margin")) this.setLayoutMargin();
},

// Debug output
// --------------------------------------------------------------------------------------------

getLengthAxis : function () { return this.vertical ? "height" : "width" },

_reportResize : function (member, breadth, length) {
    // report this size change if it's non a no-op.  We go through some contortions here in
    // order to report the resize before we actually do it, because it makes the logs much
    // easier to read
    var width = this.vertical ? breadth : length,
        height = this.vertical ? length : breadth,
        deltaX = member.getDelta("width", width, member.getWidth()),
        deltaY = member.getDelta("height", height, member.getHeight());
    if ((deltaX != null && deltaX != 0) || (deltaY != null && deltaY != 0)) {
        this.logDebug("resizing " + member +
            (member.isDrawn() ? " (drawn): " : ": ") +
            (breadth != null ? breadth + (this.vertical ? "w " : "h ") : "") +
            (length != null ? length + (this.vertical ? "h" : "w") : ""), "layout");
    }
},

reportSizes : function (layoutInfo, reason) {
    if (!this.logIsInfoEnabled(this._$layout)) return;

    var output = "layoutChildren (reason: " + reason +
        "):\nlayout specified size: " + this.getWidth() + "w x " + this.getHeight() + "h\n" +
        "drawn size: " + this.getVisibleWidth(true) + "w x " + this.getVisibleHeight(true) + "h\n" +
        "available size: " +
        this.getInnerWidth() + (!this.vertical ? "w (length) x " : "w x ") +
        this.getInnerHeight() + (this.vertical ? "h (length)\n" : "h\n");

    // report the length and breadth each member was sized to and why
    for (var i = 0; i < layoutInfo.length; i++) {
        var memberInfo = layoutInfo[i];
        output += "   " + this.members[i] + "\n";
        output += "      " + memberInfo._visibleLength + " drawn length" +
            (memberInfo._resizeLength ? " (resizeLength: " + memberInfo._resizeLength + ")" : "") +
            " (policyLength: " + memberInfo._policyLength + ")" +
            " (" + memberInfo._lengthReason + ")\n";
        output += "      " + memberInfo._breadth + " drawn breadth (" + memberInfo._breadthReason + ")\n";
    }

    if (layoutInfo.length == 0) output += "[No members]";

    this.logInfo(output, "layout");
}

});

// Preconfigured Layout classes
// --------------------------------------------------------------------------------------------

//>    @class    HLayout
//
//  A subclass of Layout that applies a sizing policy along the horizontal axis, interpreting
//  percent and "*" sizes as proportions of the width of the layout. HLayouts will set any members
//  that do not have explicit heights to match the layout.
//
// @see Layout.hPolicy
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.defineClass("HLayout","Layout").addProperties({
    orientation:"horizontal",
    // For H-Layouts perform a horizontal animation effect when showing / hiding
    animateMemberEffect:{effect:"slide", startFrom:"L", endAt:"L"}
});

//>    @class    VLayout
//
//  A subclass of Layout that applies a sizing policy along the vertical axis, interpreting
//  percent and "*" sizes as proportions of the height of the layout. VLayouts will set any
//  members that do not have explicit widths to match the layout.
//
// @see Layout.vPolicy
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.defineClass("VLayout","Layout").addProperties({
    orientation:"vertical"
});


//>    @class    HStack
//
// A subclass of Layout that simply stacks members on the horizontal axis without trying to
// manage their width.  On the vertical axis, any members that do not have explicit heights will
// be sized to match the height of the stack.
//
// @see Layout.hPolicy
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.defineClass("HStack","Layout").addProperties({
    orientation:"horizontal",
    hPolicy:isc.Layout.NONE,
    // For HStacks perform a horizontal animation effect when showing / hiding
    animateMemberEffect:{effect:"slide", startFrom:"L", endAt:"L"},
    // NOTE: set a small defaultWidth since typical use is auto-sizing to contents on the
    // length axis, in order to avoid a mysterious 100px minimum length.  Since this is just a
    // defaultWidth, this really only affects HStacks which are not nested inside other
    // Layouts/Stacks
    defaultWidth:20

});

//>    @class    VStack
//
// A subclass of Layout that simply stacks members on the vertical axis without trying to
// manage their height.  On the horizontal axis, any members that do not have explicit widths
// will be sized to match the width of the stack.
//
// @see Layout.vPolicy
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.defineClass("VStack","Layout").addProperties({
    orientation:"vertical",
    vPolicy:isc.Layout.NONE,
    defaultHeight:20 // see defaultWidth setting for HStack above
});

// LayoutSpacer
// --------------------------------------------------------------------------------------------

//>    @class    LayoutSpacer
//
// Add a LayoutSpacer to a Layout to take up space just like a normal member, without actually
// drawing anything.  Semantically equivalent to using an empty canvas, but higher performance
// for this particular use case.
//
//  @treeLocation Client Reference/Layout
//  @visibility external
//<
// NOTE: LayoutSpacer is a Canvas so that it can respond to all sizing, etc, methods, however, it
// never actually draws.
isc.defineClass("LayoutSpacer","Canvas").addMethods({
    overflow:"hidden",
    draw : isc.Canvas.NO_OP,
    redraw : isc.Canvas.NO_OP,
    _hasUndrawnSize:true
});

// register 'members' as a dup-property. This means if a layout subclass instance prototype
// has 'members' assigned it'll be duplicated (and shallow cloned) on instances.
isc.Layout.registerDupProperties("members");








//>    @class    Button
//
// The Button widget class implements interactive, style-based button widgets.
//
// @treeLocation Client Reference/Control
// @visibility external
//<

//> @groupDef buttonIcon
// Control over optional icons shown in Buttons, Labels and other contexts
// @title Button Icon
// @visibility external
//<

isc.ClassFactory.defineClass("Button", "StatefulCanvas").addProperties({


    // Various properties documented on StatefulCanvas that affect all buttons
    // NOTE: This block is included in Button, ImgButton, and StrechlImgButton.
    //       If you make changes here, make sure you duplicate it to the other
    //       classes.
    //
    // End of this block is marked with: END StatefulCanvas @include block
    // ========================================================================

    // Title
    //------
    //> @attr button.title (string : "Untitled Button" : IRW)
    // @include statefulCanvas.title
    // @visibility external
    // @group basics
    // @group i18nMessages
    // @example buttonStates
    //<
    title:"Untitled Button",

    //> @attr button.clipTitle (Boolean : true : IR)
    // If this.overflow is "hidden" and the title for this button is too large for the available
    // space, should the title be clipped by an ellipsis?
    // <p>
    // This feature is supported only in browsers that support the CSS UI text-overflow
    // property (IE6+, Firefox 7+, Safari, Chrome, Opera 9+).
    //<
    clipTitle: true,

    //> @attr button.hiliteAccessKey    (boolean : null : IRW)
    // @include statefulCanvas.hiliteAccessKey
    // @visibility external
    //<

    //>    @method    button.getTitle()    (A)
    // @include statefulCanvas.getTitle
    // @visibility external
    //<
    //>    @method    button.setTitle()
    // @include statefulCanvas.setTitle
    // @visibility external
    //<

    //> @attr button.showClippedTitleOnHover (Boolean : false : IRW)
    // If true and the title is clipped, then a hover containing the full title of this button
    // is enabled.
    // @group hovers
    // @visibility external
    //<
    showClippedTitleOnHover:false,

    _canHover:true,


    // don't set className on the widget's handle, because we apply styling to another element
    suppressClassName:true,

    // Icon
    //------

    // set useEventParts to true so we can handle an icon click separately from a
    // normal button click if we want
    useEventParts:true,

    //> @attr button.icon
    // @include statefulCanvas.icon
    // @visibility external
    // @example buttonIcons
    //<
    //> @attr button.iconSize
    // @include statefulCanvas.iconSize
    // @visibility external
    //<
    //> @attr button.iconWidth
    // @include statefulCanvas.iconWidth
    // @visibility external
    //<
    //> @attr button.iconHeight
    // @include statefulCanvas.iconHeight
    // @visibility external
    //<
    //> @attr button.iconOrientation
    // @include statefulCanvas.iconOrientation
    // @visibility external
    // @example buttonIcons
    //<
    //> @attr button.iconAlign
    // @include statefulCanvas.iconAlign
    // @visibility external
    //<
    //> @attr button.iconSpacing
    // @include statefulCanvas.iconSpacing
    // @visibility external
    //<
    //> @attr button.showDisabledIcon
    // @include statefulCanvas.showDisabledIcon
    // @visibility external
    //<
    //> @attr button.showRollOverIcon
    // @include statefulCanvas.showRollOverIcon
    // @visibility external
    //<

    //> @attr button.showFocusedIcon
    // @include statefulCanvas.showFocusedIcon
    // @visibility external
    //<
    //> @attr button.showDownIcon
    // @include statefulCanvas.showDownIcon
    // @visibility external
    // @example buttonIcons
    //<
    //> @attr button.showSelectedIcon
    // @include statefulCanvas.showSelectedIcon
    // @visibility external
    //<
    //> @method button.setIconOrientation()
    // @include statefulCanvas.setIconOrientation
    // @visibility external
    //<
    //> @method button.setIcon()
    // @include statefulCanvas.setIcon
    // @visibility external
    //<

    // AutoFit
    //--------
    //> @attr button.autoFit
    // @include statefulCanvas.autoFit
    // @group sizing
    // @visibility external
    // @example buttonAutoFit
    //<
    //> @method button.setAutoFit()
    // @include statefulCanvas.setAutoFit
    // @visibility external
    //<

    // only autoFit horizontally by default
    autoFitDirection:"horizontal",

    // baseStyle
    //----------
    //> @attr button.baseStyle (CSSStyleName : "button" : IRW)
    // @include statefulCanvas.baseStyle
    // @visibility external
    //<
    baseStyle:"button",
    //> @method button.setBaseStyle()
    // @include statefulCanvas.setBaseStyle
    // @visibility external
    //<

    // selection
    //----------
    //> @attr button.selected
    // @include statefulCanvas.selected
    // @visibility external
    //<
    //> @method button.select()
    // @include statefulCanvas.select
    // @visibility external
    //<
    //> @method button.deselect()
    // @include statefulCanvas.select
    // @visibility external
    //<
    //> @method button.isSelected()
    // @include statefulCanvas.isSelected
    // @visibility external
    //<
    //> @method button.setSelected()
    // @include statefulCanvas.select
    // @visibility external
    //<

    // radioGroup
    //-----------
    //> @attr button.radioGroup
    // @include statefulCanvas.radioGroup
    // @visibility external
    // @example buttonRadioToggle
    //<
    //> @method button.addToRadioGroup()
    // @include statefulCanvas.addToRadioGroup
    // @visibility external
    //<
    //> @method button.removeFromRadioGroup()
    // @include statefulCanvas.removeFromRadioGroup
    // @visibility external
    //<
    //> @attr button.actionType
    // @include statefulCanvas.actionType
    // @visibility external
    // @example buttonRadioToggle
    //<
    //> @method button.setActionType()
    // @include statefulCanvas.setActionType
    // @visibility external
    //<
    //> @method button.getActionType()
    // @include statefulCanvas.getActionType
    // @visibility external
    //<

    // state
    //------
    //> @attr button.state
    // @include statefulCanvas.state
    // @visibility external
    //<
    //> @method button.setState()
    // @include statefulCanvas.setState
    // @visibility external
    //<
    //> @method button.setDisabled()
    // @include statefulCanvas.setDisabled
    // @visibility external
    //<
    //> @method button.getState()
    // @include statefulCanvas.getState
    // @visibility external
    //<
    //> @attr button.showDisabled
    // @include statefulCanvas.showDisabled
    // @visibility external
    // @example buttonStates
    //<
    //> @attr button.showDown
    // @include statefulCanvas.showDown
    // @visibility external
    // @example buttonStates
    //<
    //> @attr button.showFocused
    // @include statefulCanvas.showFocused
    // @visibility external
    //<
    showDown:true,

    showFocused:true,
    //> @attr button.showRollOver
    // @include statefulCanvas.showRollOver
    // @visibility external
    // @example buttonStates
    //<
    showRollOver:true,


    mozOutlineOffset: "0px",

    // alignment
    //----------
    //> @attr button.align
    // @include statefulCanvas.align
    // @visibility external
    //<
    //> @attr button.valign
    // @include statefulCanvas.valign
    // @visibility external
    //<


    // Button.action
    //> @method button.action()
    // @include statefulCanvas.action
    // @visibility external
    //<

    // ================= END StatefulCanvas @include block =============== //


    //>    @attr    button.wrap        (Boolean : false : [IRW])
    // A boolean indicating whether the button's title should word-wrap, if necessary.
    // @group basics
    //      @visibility external
    //<
    wrap:false,

    // NOTE: by setting "height" rather than "defaultHeight", we make this into an explicit
    // setting which will be respected by a Layout
    height:20,
    width:100,

    //>    @attr    button.overflow        (attrtype : isc.Canvas.HIDDEN : IRWA)
    // Clip the contents of the button if necessary
    //<
    overflow:isc.Canvas.HIDDEN,

    //>    @attr    button.redrawOnDisable        (boolean : true : IRWA)
    // true == redraw the button when it's enabled/disabled
    //<
    redrawOnDisable:false,

    //>    @attr    button.redrawOnStateChange        (boolean : true : IRWA)
    // true == redraw the button when it's state changes
    //        @group    state
    //<
    redrawOnStateChange:false,

    //>    @attr    button.cursor        (Cursor : isc.Canvas.HAND : IRW)
    // Hand cursor since these items are clickable
    //<
    cursor:isc.Canvas.HAND,

    // Style of the button is set via baseStyle, etc. above
    // NOTE: the button applies its CSS style to a contained cell, not the Canvas itself.
    className:null,

    // If true, add a space to left or right-aligned titles so that they are not flush with
    // the edge of the widget.
    // NOTE: FIXME: this should really be done via CSS padding, hence not external doc'd
    //padTitle:false,

    //> @attr statefulCanvas.titleStyle        (CSSStyleName : "normal" : [IR])
    // For buttons with icons only, optional style to be applied to title text only.  This
    // style should contain text-related properties only (such as font size); border, padding
    // and background color should be specified in the style used as the "baseStyle".
    //
    // This property applied only to icon buttons rendered with a subtable, and currently only
    // works if redrawOnStateChange is true.  Internal for now.
    //<

    //titleStyle:"buttonTitle",

    canFocus:true
});

// add instance methods
isc.Button.addMethods({

//>    @method    button.initWidget()    (A)
//            Extended initWidget() to allow initialization of the enabled property
//
//        @param    [all arguments]    (object)    objects with properties to override from default
//<
initWidget : function () {



    if (this.border != null && !isc.StatefulCanvas.pushTableBorderStyleToDiv) {
        this._buttonBorder = this.border;
        this.border = null;
    }
    if (this.padding != null) {
        this._buttonPadding = this.padding;
        this.padding = null;
    }
    if (this.backgroundColor != null) {
        this._buttonBGColor = this.backgroundColor;
        this.backgroundColor = null;
    }


    var defaultSetting = isc.Button._defaultRedrawOnResize;
    if (defaultSetting == null) {
        defaultSetting = isc.Button._defaultRedrawOnResize =
            (isc.Browser.isIE ||
             (isc.Browser.isMoz
              && !isc.Browser.isStrict &&
              isc.Canvas.getInstanceProperty("_useMozScrollbarsNone")) ?
              false : true);
    }
    this.redrawOnResize = defaultSetting;


    this.forceHandleOverflowHidden = isc.StatefulCanvas.pushTableBorderStyleToDiv;

    // Call super implementation directly rather than using Super() to avoid a string
    // allocation.
    return isc.StatefulCanvas._instancePrototype.initWidget.call(this);
},

// __adjustOverflow() calls _setHandleRect() to apply new bounds to the clip handle
// when, for example, a vertical scrollbar is added. _setHandleRect() adjusts the dimensions
// that it receives and calls _assignSize() to set the top, left, width, and height.
//
// _assignSize() is overridden here to update the width set on the TABLE element, which should
// be the same as the clip handle width.
_assignSize : function (styleHandle, prop, size, d, e) {
    this.invokeSuper(isc.Button, "_assignSize", styleHandle, prop, size, d, e);
    if (prop == this._$width) {
        var tableElem = this.getHandle().firstChild;
        tableElem.width = size;
    }
    if (prop == this._$height) {
        var tableElem = this.getHandle().firstChild;
        tableElem.height = size;
    }
},

getCanHover : function (a, b, c) {
    return this._canHover || this.invokeSuper(isc.Button, "getCanHover", a, b, c);
},

shouldClipTitle : function () {
    return this.getOverflow() == isc.Canvas.HIDDEN && !!this.clipTitle;
},

_$titleClipper:"titleClipper",
_getTitleClipperID : function () {
    return this._getDOMID(this._$titleClipper);
},

//> @method button.titleClipped() (A)
// Is the title of this button clipped?
// @return (boolean) whether the title is clipped.
// @visibility external
//<
titleClipped : function () {
    var titleClipperHandle = isc.Element.get(this._getTitleClipperID());
    return (titleClipperHandle == null
            ? false
            : isc.Element.getClientWidth(titleClipperHandle) < titleClipperHandle.scrollWidth);
},

defaultTitleHoverHTML : function () {
    return this.getTitleHTML();
},

//> @method button.titleHoverHTML()
// Returns the HTML that is displayed by the default +link{Button.titleHover(),titleHover}
// handler. Return null or an empty string to cancel the hover.
// <var class="smartgwt"><p>Use <code>setTitleHoverFormatter()</code> to provide a custom
// implementation.</var>
// @param defaultHTML (HTMLString) the HTML that would have been displayed by default
// @return (HTMLString) HTML to be displayed in the hover. If null or an empty string, then the hover
// is canceled.
// @visibility external
//<
titleHoverHTML : function (defaultHTML) {
    return defaultHTML;
},

handleHover : function (a, b, c) {
    // If there is a prompt, prefer the standard hover handling.
    if (this.canHover == null && this.prompt) return this.invokeSuper(isc.Button, "handleHover", a, b, c);

    if (!this.showClippedTitleOnHover || !this.titleClipped()) {
        if (this.canHover) return this.invokeSuper(isc.Button, "handleHover", a, b, c);
        else return;
    }

    if (this.titleHover && this.titleHover() == false) return;

    var HTML = this.titleHoverHTML(this.defaultTitleHoverHTML());
    if (HTML != null && !isc.isAn.emptyString(HTML)) {
        var hoverProperties = this._getHoverProperties();
        isc.Hover.show(HTML, hoverProperties, null, this);
    }
},

//> @method button.getInnerHTML() (A)
// Return the HTML for this button
//        @group    drawing
//
//        @return    (string)    HTML output for the button
//<
getInnerHTML : function () {
    var iconAtEdge = this._iconAtEdge(),
        clipTitle = this.shouldClipTitle();
    if (this.isPrinting || iconAtEdge || !clipTitle ||
        (isc.Browser.isIE && ((!isc.Browser.isStrict && isc.Browser.version < 10) ||
                              isc.Browser.version <= 7)))
    {


        var button = isc.Button;
        if (!button._buttonHTML) {

            button._100Size = " width='100%' height='100%";
            button._100Width = " width='100%";
            button._widthEquals = "width='";
            button._heightEquals = "' height='";
            button._hiddenOverflow = "' style='table-layout:fixed;overflow:hidden;";

            var cellStartHTML = button._cellStartHTML = [];
            button._gt = ">";
            button._nowrapTrue = " nowrap='true'";
            button._classEquals = " class='";
            button._colWidthEquals = "<col width='";
            button._pxEndCol = "px'/>";
            button._emptyCol = "<col/>";
            cellStartHTML[0] = "'><colgroup>";
            // [1] _emptyCol or _colWidthEquals
            // [2] null or afterPadding or _colWidthEquals
            // [3] null or afterPadding or _pxEndCol
            // [4] null or _pxEndCol or _emptyCol
            cellStartHTML[5] = "</colgroup><tbody><tr><td";
            // [6] null or _nowrapTrue
            // [7] _classEquals

            button._cellStartWrap = "'><tbody><tr><td class='";
            button._cellStartNoWrap = "'><tbody><tr><td nowrap='true' class='";

            var buttonHTML = button._buttonHTML = [];
            // NOTE: for DOM platforms, padding should be achieved by CSS padding and spacing
            // by CSS margins
            buttonHTML[0] = "<table cellspacing='0' cellpadding='0' ";
            // [1] 100% width and height, or width=
            // [2] null or this.getWidth()
            // [3] null or height=
            // [4] null or this.getHeight();

            // [5] overflow setting
            // [6] cell start (wrap/nowrap variants)
            // [7] CSS class

            // [8] optional cssText

            buttonHTML[9] = "' align='";
            // [10] align
            // [11] valign
            button._valignCenter = "' valign='center";
            button._valignTop = "' valign='top";
            button._valignBottom = "' valign='bottom";

            // [12-13] titleClipper ID
            button._id = "' id='";

            // [14-16] tabIndex and focus

            button._tabIndexStart = "' tabindex='-1' onfocus='";
            button._callFocus = "._cellFocus()'>";
            button._closeQuoteRightAngle = "'>";

            // IE
            // [17] title

            // Moz
            // [17] Moz start DIV
            // [18] title
            // [19] Moz end DIV

            // end table (see _endTemplate)
        }

        var buttonHTML = button._buttonHTML;
        // if we're printing the button, make it fit its parent element
        // If we're not redrawing on resize, use 100% sizing - will reflow on resize of parent
        // element
        if (this.isPrinting || this.redrawOnResize == false) {
            // if we're not going to redraw on resize, write HTML that reflows automatically.  Not
            // yet possible in every browser.

            buttonHTML[1] = (this.isPrinting ? button._100Width : button._100Size);
            buttonHTML[2] = null; buttonHTML[3] = null; buttonHTML[4] = null;
        } else {
            buttonHTML[1] = button._widthEquals;
            buttonHTML[2] = this.getInnerWidth();
            buttonHTML[3] = button._heightEquals;
            buttonHTML[4] = this.getInnerHeight();
        }


        if (this.overflow == isc.Canvas.VISIBLE) {
            buttonHTML[5] = null;
        } else {
            buttonHTML[5] = button._hiddenOverflow;
        }

        // Inside the cell:


        var afterPadding;
        if (isc.Browser.isIE && !isc.Browser.isStrict && this._isStatefulCanvasLabel && isc.Browser.version < 10 &&
            (afterPadding = this._getAfterPadding == null ? null : this._getAfterPadding()) > 0)
        {
            var cellStartHTML = button._cellStartHTML;
            cellStartHTML[1] = button._emptyCol;
            cellStartHTML[2] = button._colWidthEquals;
            cellStartHTML[3] = afterPadding;
            cellStartHTML[4] = button._pxEndCol;

            cellStartHTML[6] = (this.wrap ? null : button._nowrapTrue);
            cellStartHTML[7] = button._classEquals;

            buttonHTML[6] = cellStartHTML.join(isc.emptyString);
        } else {
            buttonHTML[6] = (this.wrap ? button._cellStartWrap : button._cellStartNoWrap);
        }

        buttonHTML[7] = this.isPrinting ? this.getPrintStyleName() : this.getStateName();


        var isTitleClipper = !iconAtEdge && clipTitle;


        var writeStyle = isTitleClipper || this.cssText || this._buttonBorder || this._buttonPadding ||
                         this._buttonBGColor || this.margin || this._writeZeroVPadding() ||
                         isc.StatefulCanvas.pushTableBorderStyleToDiv;
        if (writeStyle) buttonHTML[8] = this._getCellStyleHTML(null, isTitleClipper);
        else buttonHTML[8] = null;

        // If the iconOrientation and iconAlign are set such that the icon is pinned to the
        // edge of the table rather than showing up next to the title, ensure we center the
        // inner table - alignment of the title will be written directly into its cell.
        buttonHTML[10] = (iconAtEdge ? isc.Canvas.CENTER : this.align);
        buttonHTML[11] = (this.valign == isc.Canvas.TOP ? button._valignTop :
                            (this.valign == isc.Canvas.BOTTOM ? button._valignBottom
                                                              : button._valignCenter) );

        if (isTitleClipper) {
            buttonHTML[12] = button._id;
            buttonHTML[13] = this._getTitleClipperID();
        } else {
            buttonHTML[13] = buttonHTML[12] = null;
        }


        if (this._canFocus() && this._useNativeTabIndex) {
            buttonHTML[14] = button._tabIndexStart;
            buttonHTML[15] = this.getID();
            buttonHTML[16] = button._callFocus;
        } else {
            buttonHTML[14] = button._closeQuoteRightAngle;
            buttonHTML[15] = buttonHTML[16] = null;
        }
        this.fillInCell(buttonHTML, 17, isTitleClipper);
        return buttonHTML.join(isc.emptyString);
    } else {
        var sb = isc.SB.create(),
            valign = (this.valign == isc.Canvas.TOP || this.valign == isc.Canvas.BOTTOM
                      ? this.valign
                      : "middle");
        sb.append("<table cellspacing='0' cellpadding='0' width='", this.getInnerWidth(),
                  "' height='", this.getInnerHeight(), "' style='table-layout:fixed'><tbody><tr><td class='",
                  this.getStateName(), "' style='", this._getCellStyleHTML([]),
                  "text-align:", (this.align != null ? this.align : isc.Canvas.CENTER),
                  ";vertical-align:", valign, "'><div style='display:inline-block;max-width:100%",
                  (!this.wrap ? ";white-space:nowrap" : ""), ";vertical-align:", valign, "'>");

        var titleClipperID = this._getTitleClipperID();
        if (this.icon && this.iconOrientation == isc.Canvas.RIGHT) {
            var extraWidth = this.getIconSpacing();
            sb.append(this._generateIconImgHTML({ extraStuff: "style='float:right;margin-left:" + extraWidth + "px;vertical-align:middle' eventpart='icon'" }));
            extraWidth += this.iconWidth || this.iconSize;
            sb.append("<div id='", titleClipperID, "' style='overflow:hidden;",
                      isc.Browser._textOverflowPropertyName, ":ellipsis;text-align:",
                      (this.align == isc.Canvas.RIGHT ? this.align : isc.Canvas.LEFT),
                      (isc.Browser.isMoz ? ";margin-right:" + extraWidth + "px" : ""),
                      // only set the line-height to the icon's height if we're not wrapping
                      (!this.wrap ? ";line-height:" + (this.iconHeight || this.iconSize) + "px" : ""),
                      "'>", this.getTitleHTML(), "</div>");
        } else {
            sb.append("<div id='", titleClipperID, "' style='overflow:hidden;",
                      isc.Browser._textOverflowPropertyName, ":ellipsis;text-align:",
                      (this.align == isc.Canvas.RIGHT ? this.align : isc.Canvas.LEFT), "'>");
            if (this.icon) {
                sb.append(this._generateIconImgHTML({ extraStuff: "style='margin-right:" + this.getIconSpacing() + "px;vertical-align:middle' eventpart='icon'" }));
            }
            sb.append(this.getTitleHTML(), "</div>");
        }

        sb.append("</div></td></tr></tbody></table>");
        return sb.release();
    }
},

// force a redraw on setOverflow()
// This is required since we write out clipping HTML for our title table if our overflow
// is hidden (otherwise we don't), so we need to regenerate this.
setOverflow : function () {
    var isDirty = this.isDirty();
    this.Super("setOverflow", arguments);
    if (!isDirty) this.redraw();
},

// override getPrintTagStart to avoid writing out the printClassName on the outer div
getPrintTagStart : function (absPos) {
    var props = this.currentPrintProperties,
        topLevel = props.topLevelCanvas == this,
        inline = !absPos && !topLevel && props.inline;

    return [((this.wrap == false) ? "<div style='white-space:nowrap' " : inline ? "<span " : "<div "),
            // could add borders etc here
            this.getPrintTagStartAttributes(absPos),
            ">"].join(isc.emptyString);
},


_$pxSemi:"px;", _$semi:";",
_$borderColon:"border:",
_$zeroVPad:"padding-top:0px;padding-bottom:0px;",
_$paddingColon:"padding:",
_$paddingRightColon:"padding-right:",
_$paddingLeftColon:"padding-left:",
_$bgColorColon:"background-color:",
_$zeroMargin:"margin:0px;",
_$filterNone:"filter:none;",
_$textOverflowEllipsis:isc.Browser._textOverflowPropertyName + ":ellipsis;overflow:hidden;",
_$cellStyleTemplate:[
    "' style='", // [0]
    ,           // [1] explicit css text applied to the button

    ,           // [2] null or "border:" (button border)
    ,           // [3] null or this._buttonBorder (button border)
    ,           // [4] null or ";" (button border)

    ,           // [5] null or "padding:" (button padding)
    ,           // [6] null or this._buttonPadding (button padding)
    ,           // [7] null or ";"  (button padding)

    ,           // [8] null or backgroundColor (button bg color)
    ,           // [9] null or this._buttonBGColor (button bg color)
    ,           // [10] null or ";" (button bg color)

    ,           // [11] null or "margin:0px" (avoid margin doubling)
    ,           // [12] null or "filter:none" (avoid IE8 filter issues)

    ,           // [13] null or "text-overflow:ellipsis;overflow:hidden;"

    ,           // [14] null or "padding-right:"/"padding-left:" (after padding)
    ,           // [15] null or this._getAfterPadding() (after padding)
    null        // [16] null or "px;" (after padding)

    // No need to close the quote - the button HTML template handles this.
],


_getCellStyleHTML : function (template, isTitleClipper) {
    template = template || this._$cellStyleTemplate;

    template[1] = (this.cssText ? this.cssText : null);

    var border = isc.StatefulCanvas.pushTableBorderStyleToDiv ? "none" : this._buttonBorder;
    if (border != null) {
        template[2] = this._$borderColon;
        template[3] = border;
        template[4] = this._$semi;
    } else {
        template[2] = null;
        template[3] = null;
        template[4] = null;
    }

    var padding = this._buttonPadding;
    if (padding != null) {
        template[5] = this._$paddingColon;
        template[6] = padding;
        template[7] = this._$pxSemi;
    } else {
        template[5] = null;
        template[6] = null;
        template[7] = null;
    }
    if (this._writeZeroVPadding()) {
        template[7] = (template[7] || isc.emptyString) + this._$zeroVPad;
    }

    if (this._buttonBGColor != null) {
        template[8] = this._$bgColorColon;
        template[9] = this._buttonBGColor;
        template[10] = this._$semi;
    } else {
        template[8] = null;
        template[9] = null;
        template[10] = null;
    }

    if (this.margin != null) template[11] = this._$zeroMargin;
    else template[11] = null;

    if (isc.Browser.useCSSFilters) template[12] = null;
    else template[12] = this._$filterNone;

    if (isTitleClipper) template[13] = this._$textOverflowEllipsis;
    else template[13] = null;

    var afterPadding;
    if ((!isc.Browser.isIE || isc.Browser.isStrict || !this._isStatefulCanvasLabel || isc.Browser.version >= 10) &&
        (afterPadding = (this._getAfterPadding == null ? null : this._getAfterPadding())) > 0)
    {
        template[14] = (this.isRTL() ? this._$paddingLeftColon : this._$paddingRightColon);
        template[15] = afterPadding;
        template[16] = this._$pxSemi;
    } else {
        template[16] = template[15] = template[14] = null;
    }

    return template.join(isc.emptyString);
},


_writeZeroVPadding : function () {
    return this.overflow == isc.Canvas.HIDDEN &&
           // don't remove padding during animations or text may reflow
           !this.isAnimating() &&
            (isc.Browser.isMoz || isc.Browser.isSafari || isc.Browser.isIE);
},


setBorder : function (border) {
    var pushStyle = isc.StatefulCanvas.pushTableBorderStyleToDiv;
    if (pushStyle) this.border = border;
    else    this._buttonBorder = border;
    this.markForRedraw();
},
setPadding : function (padding) {
    this._buttonPadding = padding;
    this.markForRedraw();
},
setBackgroundColor : function (color) {
    this._buttonBGColor = color;
    this.markForRedraw();
},

_$endTable :"</td></tr></tbody></table>",
_endTemplate : function (template, slot) {
    template[slot] = this._$endTable;
    template.length = slot+1;
    return template;
},

_$innerTableStart : "<table cellspacing='0' cellpadding='0'><tbody><tr><td ",
_$fillInnerTableStart : "<table width='100%' cellspacing='0' cellpadding='0'><tbody><tr><td ",
_$fillInnerFixedTableStart : "<table width='100%' cellspacing='0' cellpadding='0' style='table-layout:fixed'><tbody><tr><td ",


_$leftIconCellStyleStart : "font-size:" +
                            (isc.Browser.isFirefox && isc.Browser.isStrict ? 0 : 1) +
                            "px;padding-right:",
_$rightIconCellStyleStart : "font-size:" +
                            (isc.Browser.isFirefox && isc.Browser.isStrict ? 0 : 1) +
                            "px;padding-left:",
_$pxClose : "px'>",
_$newInnerCell : "</td><td ",

_$classEquals : "class='",

//_$tableNoStyleDoubling : defined in Canvas.js

_$closeInnerTag : "'>",
_$closeInnerTagNoWrap : "' nowrap='true'>",

_$innerTableEnd : "</td></tr></tbody></table>",

// used to check alignment for the icon
_$right:"right",

// Helper - is the icon pinned to the left / right edge, rather than floated next to the title?
_iconAtEdge : function () {
    return this.icon != null && this.iconAlign != null &&
                (this.iconAlign == this.iconOrientation) &&
                (this.iconAlign != this.align);
},

getIconSpacing : function () {
    if (this.icon == null || this.title == null) return 0;
    return this.iconSpacing;
},

fillInCell : function (template, slot, cellIsTitleClipper) {

    var rtl = this.isRTL();

    var title = this.getTitleHTML();

    if (!this.icon) {
        if (isc.Browser.isMoz) {
            var minHeight = this.reliableMinHeight;
            template[slot] = (minHeight ? "<div>" : null);
            template[slot+1] = title;
            template[slot+2] = (minHeight ? "</div>" : null);
            this._endTemplate(template, slot+3)
        } else {
            template[slot] = title;
            this._endTemplate(template, slot+1)
        }
        return;
    }

    var iconLeft = this.iconOrientation != this._$right,
        iconImg = this._generateIconImgHTML();




    // draw icon and text with spacing w/o a table.
    if (cellIsTitleClipper || this.noIconSubtable) {
        var spacer = isc.Canvas.spacerHTML(this.getIconSpacing(),1);
        template[slot] = (iconLeft ? isc.SB.concat(iconImg, spacer, title)
                                   : isc.SB.concat(title, spacer, iconImg));
        this._endTemplate(template, slot+1)
        return;
    }

    // Should we have the icon show up at the edge of the button, rather than being
    // adjacent to the title text?


    var iconAtEdge = this._iconAtEdge(),
        iconCellSpace;
    if (iconAtEdge) {
        iconCellSpace = (this.iconWidth ? this.iconWidth : this.iconSize) +

            (isc.Browser.isBorderBox ? this.getIconSpacing() : 0)
    }

    var clipTitle = this.shouldClipTitle();

    // if the icon is showing at one edge (and the text is separated from it), draw the
    // table 100% wide
    template[slot] = (iconAtEdge
                      ? (clipTitle
                         ? this._$fillInnerFixedTableStart
                         : this._$fillInnerTableStart)
                      : this._$innerTableStart);

    var styleName = this.isPrinting ? this.getPrintStyleName() :
                    (this.titleStyle
                      ? this.getTitleStateName()
                      : this.getStateName()
                    );

    var tableNoStyleDoubling = this._$tableNoStyleDoubling;
    if (!isc.Browser.useCSSFilters) tableNoStyleDoubling += this._$filterNone;

    if (iconLeft) {

        // icon cell
        template[++slot] = this._$classEquals;
        template[++slot] = styleName;
        template[++slot] = tableNoStyleDoubling;

        template[++slot] = !rtl ? this._$leftIconCellStyleStart :
                                  this._$rightIconCellStyleStart;

        template[++slot] = this.getIconSpacing();
        if (iconAtEdge) {
            template[++slot] = "px;width:";
            template[++slot] = iconCellSpace;
        }
        template[++slot] = this._$pxClose;
        template[++slot] = iconImg;
        // title cell
        template[++slot] = this._$newInnerCell;
        template[++slot] = this._$classEquals;

        template[++slot] = styleName;
        template[++slot] = tableNoStyleDoubling;
        if (clipTitle) template[++slot] = this._$textOverflowEllipsis;

        if (iconAtEdge) {
            template[++slot] = "' align='"
            template[++slot] = this.align;
        }
        if (clipTitle) {
            template[++slot] = isc.Button._id;
            template[++slot] = this._getTitleClipperID();
        }
        template[++slot] = (this.wrap ? this._$closeInnerTag : this._$closeInnerTagNoWrap)
        template[++slot] = title;

    } else {
        // title cell:
        template[++slot] = this._$classEquals;
        template[++slot] = styleName;
        template[++slot] = tableNoStyleDoubling;
        if (clipTitle) template[++slot] = this._$textOverflowEllipsis;

        if (iconAtEdge) {
            template[++slot] = "' align='";
            template[++slot] = this.align;
        }
        if (clipTitle) {
            template[++slot] = isc.Button._id;
            template[++slot] = this._getTitleClipperID();
        }
        template[++slot] = (this.wrap ? this._$closeInnerTag : this._$closeInnerTagNoWrap)
        template[++slot] = title;

        // icon cell
        template[++slot] = this._$newInnerCell;

        template[++slot] = this._$classEquals;
        template[++slot] = styleName;
        template[++slot] = tableNoStyleDoubling;

        template[++slot] = !rtl ? this._$rightIconCellStyleStart :
                                  this._$leftIconCellStyleStart;
        template[++slot] = this.getIconSpacing();
        if (iconAtEdge) {
            template[++slot] = "px;width:";
            template[++slot] = iconCellSpace;
        }
        template[++slot] = this._$pxClose;
        template[++slot] = iconImg;

    }
    template[++slot] = this._$innerTableEnd;

    this._endTemplate(template, slot+1)
},





_imgParams : {
    align : "absmiddle", // just prevents default "texttop" from kicking in
    extraStuff : " style='vertical-align:middle' eventpart='icon'"
},
_$icon:"icon",
_generateIconImgHTML : function (imgParams) {
    // NOTE: we reuse a single global imgParams structure, so we must set every field we ever
    // use every time.
    imgParams = isc.addProperties({}, imgParams || this._imgParams);
    if (this.iconStyle != null) {
        var classText = " class='" + this.iconStyle + this.getStateSuffix() + this._$singleQuote;
        if (imgParams.extraStuff == null) imgParams.extraStuff = classText;
        else imgParams.extraStuff += classText;
    }

    imgParams.name = this._$icon;
    imgParams.width = this.iconWidth || this.iconSize;
    imgParams.height = this.iconHeight || this.iconSize;
    imgParams.src = this._getIconURL();

    return this.imgHTML(imgParams);
},
_getIconURL : function () {
    var state = this.state,
        selected = this.selected,
        customState = this.getCustomState(),
        sc = isc.StatefulCanvas;

    // ignore states we don't care about
    if (state == sc.STATE_DISABLED && !this.showDisabledIcon) state = null;
    else if (state == sc.STATE_DOWN && !this.showDownIcon) state = null;
    else if (state == sc.STATE_OVER && !this.showRollOverIcon) state = null;

    if (!this.showIconState) {
        state = null;
        customState = null;
    }

    if (selected && !this.showSelectedIcon) selected = false;
    // Note that getFocusedState() will return false if showFocusedAsOver is true, which is
    // appropriate
    var focused = this.showFocusedIcon ? this.getFocusedState() : null;
    var icon = this.icon;
    if (isc.isAn.Object(icon)) icon = icon.src;
    return isc.Img.urlForState(icon, selected, focused, state, null, customState);
},

getTitleHTML : function (a,b,c,d) {
    // This will call getTitle() so return contents if appropriate, and will hilite accessKeys
    var title = this.invokeSuper(isc.Button, "getTitleHTML", a,b,c,d);

    // FIXME: title padding should be accomplished with CSS
    if (!this.padTitle || this.align == isc.Canvas.CENTER) return title;

    if (this.align == isc.Canvas.RIGHT) return title + isc.nbsp;
    else if (this.align == isc.Canvas.LEFT) return isc.nbsp + title;
},


//> @method Button.setWrap()
// Set whether the title of this button should be allowed to wrap if too long for the button's
// specified width.
//
// @param newWrap (boolean) whether to wrap the title
// @visibility external
//<
setWrap : function (newWrap) {
    if (this.wrap != newWrap) {
        // NOTE: wrap can almost certainly be changed on the fly w/o redraw, at least on modern
        // browsers
        this.wrap = newWrap;
        this.markForRedraw("wrapChanged");
    }
},

// get the cell holding the title text.  DOM only.
getTitleCell : function () {
    if (!this.getHandle()) return null;
    var table = this.getHandle().firstChild,
        row = table && table.rows != null ? table.rows[0] : null,
        cell = row && row.cells != null ? row.cells[0] : null;
    return cell;
},

// get the minimum height of this button which would not clip the title text as it is currently
// wrapped.  Only available after drawing.  For Moz, must set "reliableMinHeight" for
// this to be reliable.
getButtonMinHeight : function () {


    var titleCell = this.getTitleCell();
    // In IE, and probably other DOM browsers, the cell's scrollHeight is reliable
    if (!isc.Browser.isMoz) {
        return titleCell.scrollHeight + isc.Element._getVBorderSize(this.getStateName());
    }


    return titleCell.firstChild.offsetHeight +
        isc.Element._getVBorderSize(this.getStateName());
},

// get the width this button would need to be in order to show all text without wrapping
// XXX move deeper, to Canvas?
getPreferredWidth : function () {



    var oldWrap = this.wrap,
        oldOverflow = this.overflow,
        oldWidth = this.width;

    // set overflow visible with no minimum width in order to get the minimum width that won't
    // wrap or clip the title text
    // XXX because wrapping is controlled by a <NOBR> tag in the generated HTML, we can't detect
    // preferred width without a redraw, even if we could resize without a redraw
    this.setWrap(false);
    this.overflow = isc.Canvas.VISIBLE;
    this.setWidth(1);
    this.redrawIfDirty("getPreferredWidth");

    var width = this.getScrollWidth();

    // reset text wrapping and overflow setting
    this.setWrap(oldWrap);
    this.overflow = oldOverflow;
    // NOTE: if this button needs to redraw on resize, this will queue up a redraw, but if you
    // are trying to set the button to it's preferred size you will avoid a redraw if you set
    // the new size right away.
    this.setWidth(oldWidth);

    return width;
},

getTitle : function () {
    if (this.useContents) return this.getContents();
    return this.title;
},

//>    @method    button.stateChanged()    (A)
//        @group    appearance
//            overrides the StatefulCanvas implememntation to update the contents TD className
//<
stateChanged : function () {



    if (this.redrawOnStateChange || !this.isDrawn()) {
        return this.Super("stateChanged");
    } else {
        var stateName = this.isPrinting ? this.getPrintStyleName() : this.getStateName();

        // if the border properties are on the DIV, apply them to the element's handle now
        if (isc.StatefulCanvas.pushTableBorderStyleToDiv) this._applyBorderStyle(stateName);


        if (!this.suppressClassName) this.setClassName(stateName);
        else this.setTableClassName(stateName);

        if (this.icon) {
            // NOTE: the icon may or may not actually change to reflect states or selectedness,
            // but either state or selectedness or both may have just changed, and we may be
            // transitioning from a state we do show to a state we don't, so no-oping is
            // tricky; we don't both for now.
            this.setImage(this._$icon, this._getIconURL());

            if (this.iconStyle) this.getImage(this._$icon).className = this.iconStyle + this.getStateSuffix();
        }

        // If we have a titleStyle and we are using a subtable, then update the styles of the
        // subtable's cells.
        var TD;
        if (this.titleStyle && (TD = this.getTitleCell()) != null) {
            var firstChild = TD.firstChild;
            if (firstChild != null && firstChild.tagName == this._$TABLE) {
                var titleStyleName = this.isPrinting ? this.getPrintStyleName() : this.getTitleStateName();


                var cells = firstChild.rows[0].childNodes;
                for (var i = 0; i < cells.length; i++) {
                    cells[i].className = titleStyleName;
                }
            }
        }
    }
},

// Set the css className of the table cell
_$TABLE: "TABLE",
setTableClassName : function (newClass){
    if (isc.StatefulCanvas.pushTableBorderStyleToDiv) {
        this._cachedBorderSize = null;
    }

    var TD = this.getTitleCell();
    if (!TD) return;
    if (TD.className != newClass) TD.className = newClass;

    if (this.icon && !this.noIconSubtable && !this.titleStyle) {
        // if we're using a subtable, update the style on the title cell too (it won't
        // cascade).

        var firstChild = TD.firstChild;
        if (firstChild != null && firstChild.tagName == this._$TABLE) {

            var cells = firstChild.rows[0].children;
            if (cells != null) {
                for (var i = 0; i < cells.length; i++) {
                    if (cells[i] && cells[i].className != newClass) cells[i].className = newClass;
                }
            }
        }
    }


    if (this.overflow == isc.Canvas.VISIBLE) {

        this._resetHandleOnAdjustOverflow = true;
        this.adjustOverflow("table style changed");
    }
},


getScrollWidth : function (recalculate,a,b,c) {
    var width = this.invokeSuper(isc.Button, "getScrollWidth", recalculate,a,b,c);
    if (!recalculate || !this.isDrawn() || !(isc.Browser.isMoz && isc.Browser.isMac)) {
        return width;
    }
    var handle = this.getHandle();
    if (handle) {
        var tableWidth = handle.firstChild.offsetWidth;
        if (tableWidth > width) {

            width = tableWidth;
        }
    }
    return width;
},

setIcon : function (icon) {
    var hadIcon = this.icon != null;
    this.icon = icon;
    if (hadIcon && (icon != null)) this.setImage(this._$icon, this._getIconURL());
    else this.redraw();
},

_cellFocus : function () {
    isc.EH._setThread("cFCS");
    this.focus();
    isc.EH._clearThread();
},

// override _updateCanFocus() to redraw the button.  If the focusability of the button is changed
// and we're making use of native HTML focus / tabIndex behavior, we'll need to regenerate the
// inner HTML.
_updateCanFocus : function () {
    this.Super("_updateCanFocus", arguments);
    if (this._useNativeTabIndex) this.markForRedraw();
},

// return the border HTML used by getTagStart
_getBorderHTML : function () {
    if (isc.StatefulCanvas.pushTableBorderStyleToDiv) {
        var stateName = this.isPrinting ? this.getPrintStyleName() : this.getStateName();

        var borderHTML = this.border != null ? ";BORDER:" + this.border : "";
        borderHTML += isc.StatefulCanvas._getBorderCSSHTML(this.border != null, stateName);
        return borderHTML;
    }
    return this.Super("_getBorderHTML", arguments);
},

_applyBorderStyle : function (className) {
    var styleHandle = this.getHandle().style,
        properties = isc.StatefulCanvas._buildBorderStyle(this.border != null, className);

    // Reset all border styling.
    styleHandle.border = styleHandle.borderRadius = isc.emptyString;

    isc.addProperties(styleHandle, properties);
},

// CSS class that actually governs what borders appear on the handle.
// This is overridden in Button.js where we apply the baseStyle + modifier to the
// handle directly.
_getBorderClassName : function () {
    if (isc.StatefulCanvas.pushTableBorderStyleToDiv) {
        return this.getStateName();
    }
    return this.Super("_getBorderClassName", arguments);
}

//>    @method    button.setAlign()
// Sets the (horizontal) alignment of this buttons content.
//  @group positioning
//  @visibility external
//<
// defined in StatefulCanvas

//>    @method    button.setVAlign()
// Sets the vertical alignment of this buttons content.
//  @group positioning
//  @visibility external
//<
// defined in StatefulCanvas

});    // END    isc.Button.addMethods()

isc.Button.registerStringMethods({
    getTitle:null
});


// AutoFitButton
// --------------------------------------------------------------------------------------------
// Button that automatically sizes to the title text.

//> @class AutoFitButton
//
// A button that automatically sizes to the length of its title.  Implemented via the
// +link{StatefulCanvas.autoFit} property.
//
// @deprecated As of Isomorphic SmartClient version 5.5, autoFit behavior can be achieved using
// the Button class instead by setting the property +link{Button.autoFit} to true.
//
// @see Button
// @treeLocation Client Reference/Control/Button
// @visibility external
//<

isc.ClassFactory.defineClass("AutoFitButton", "Button");

isc.AutoFitButton.addProperties({
    autoFit:true
});




isc.Button.registerStringMethods({
    //>@method Button.iconClick()
    // If this button is showing an +link{Button.icon, icon}, a separate click handler for the
    // icon may be defined as <code>this.iconClick</code>.
    // Returning false will suppress the standard button click handling code.
    // @return (boolean) false to suppress the standard button click event
    // @group buttonIcon
    // @visibility external
    //<
    // don't expose the parameters - they're not really useful to the developer
    iconClick:"element,ID,event",

    //> @method button.titleHover()
    // Optional stringMethod to fire when the user hovers over this button and the title is
    // clipped. If +link{Button.showClippedTitleOnHover} is true, the default behavior is to
    // show a hover canvas containing the HTML returned by +link{Button.titleHoverHTML()}.
    // Return false to suppress this default behavior.
    // @return (boolean) false to suppress the standard hover
    // @see Button.titleClipped()
    // @group hovers
    // @visibility external
    //<
    titleHover:""
});


// Make "IButton" a synonym of Button by default.

//>    @class    IButton
//
// The IButton widget class is a class that implements the same APIs as the
// +link{class:Button} class.  Depending on the current skin, <code>IButton</code>s may be
// on the +link{StretchImgButton} component, which renders via images, or may be based on the
// +link{Button} component, which renders via CSS styles.
//
// @treeLocation Client Reference/Control
// @visibility external
//<

isc.addGlobal("IButton", isc.Button);








//>    @class    Img
//
//    The Img widget class implements a simple widget that displays a single image.
//
//  @treeLocation Client Reference/Foundation
//  @visibility external
//  @example img
//<

isc.defineClass("Img", "StatefulCanvas").addClassMethods({
    _buffer : [],
    urlForState : function (baseURL, selected, focused, state, pieceName, customState) {
        if (!baseURL) return baseURL;
        // short circuit to just return baseURL for the simple case
        if (!state && !pieceName && !selected && !focused && !customState) return baseURL;

        // break baseURL up into name and extension
        var period = baseURL.lastIndexOf(isc.dot),
            name = baseURL.substring(0, period),
            extension = baseURL.substring(period + 1),
            buffer = this._buffer;

        buffer.length = 1;
        buffer[0] = name;
        // add selected
        if (selected) {
            buffer[1] = isc._underscore;
            buffer[2] = isc.StatefulCanvas.SELECTED;
        }
        if (focused) {
            buffer[3] = isc._underscore;
            buffer[4] = isc.StatefulCanvas.FOCUSED;
        }
        // add state
        if (state) {
            buffer[5] = isc._underscore;
            buffer[6] = state;
        }
        if (customState) {
            buffer[7] = isc._underscore;
            buffer[8] = customState;
        }
        // add pieceName
        if (pieceName) {
            buffer[9] = isc._underscore;
            buffer[10] = pieceName;
        }
        buffer[11] = isc.dot;
        buffer[12] = extension;
        var result = buffer.join(isc._emptyString);
        return result;
    }
});

// add default properties
isc.Img.addProperties( {
    //> @attr    img.name    (string : "main" : IA)
    // The value of this attribute is specified as the value of the 'name' attribute in the
    // resulting HTML.
    // <p>
    // Note: this attribute is ignored if the imageType is set to "tile"
    //
    // @visibility external
    //<
    name:"main",

    //>    @attr    img.src        (SCImgURL : "blank.gif" : [IRW])
    // The base filename for the image.
    // <P>
    // If <code>img.state</code> is set, it's value will be appended to the URL before the
    // file extension.
    // <P>
    // For example, given an <code>src</code> of "findIcon.gif" and a state of
    // "Disabled", the resulting image name would be "findIcon_Disabled.gif".  Compound states
    // such as "Selected", "Focused" and "Over" or "Down" will have an intervening underscore,
    // resulting in, for example, <code>"findIcon_Selected_Down.gif"</code>.
    //
    // @group  appearance
    // @visibility external
    //<
    src:"blank.gif",

    //> @attr img.altText (String : null : IRW)
    // If specified this property will be included as the <code>alt</code> text for the image HMTL
    // element. This is useful for improving application accessibility.
    // <P>
    // <b><code>altText</code> and hover prompt / tooltip behavior:</b> Note that some
    // browsers, including Internet Explorer 9, show a native hover tooltip containing the
    // img tag's <code>alt</code> attribute. Developers should not rely on this behavior to show
    // the user a hover prompt - instead the +link{img.prompt} attribute should be used.<br>
    // To set alt text <i>and</i> ensure a hover prompt shows up in all browsers, developers may
    // set +link{img.prompt} and <code>altText</code> to the same value. If both
    // these attributes are set, the standard SmartClient prompt behavior will show a hover
    // prompt in most browsers, but will be suppressed for browsers where a native tooltip
    // is shown for altText. Note that setting <code>altText</code> and <code>prompt</code> to
    // different values is not recommended - the prompt value will be ignored in favor of the
    // altText in this case.
    // @visibility external
    // @group accessibility
    //<

    //> @attr img.prompt (String : null : IRW)
    // @include canvas.prompt
    //<


    //>    @attr    img.activeAreaHTML        (String of HTML AREA tags : null : IRWA)
    //
    // Setting this attribute configures an image map for this image.  The value is expected as a
    // sequence of &lg;AREA&gt tags - e.g:
    // <pre>
    // Img.create({
    //     src: "myChart.gif",
    //     activeAreaHTML:
    //         "&lt;AREA shape='rect' coords='10,50,30,200' title='30' href='javascript:alert(\"30 units\")'&gt;" +
    //         "&lt;AREA shape='rect' coords='50,90,80,200' title='22' href='javascript:alert(\"22 units\")'&gt;"
    // });
    // </pre>
    // <u>Implementation notes:</u>
    // <ul>
    // <li>Quotes in the activeAreaHTML must be escaped or alternated appropriately.</li>
    // <li>Image maps do not stretch to fit scaled images. You must ensure that the dimensions of
    // your Img component match the anticipated width and height of your image map (which will typically
    // match the native dimensions of your image). </li>
    // <li>To change the image map of an existing Img component, first set yourImg.activeAreaHTML,
    // then call yourImg.markForRedraw(). Calls to yourImg.setSrc() will not automatically update the
    // image map. </li>
    // <li>activeAreaHTML is not supported on tiled Img components (imageType:"tile").</li>
    // <li>Native browser support for image map focus/blur, keyboard events, and certain AREA tag
    // attributes (eg NOHREF, DEFAULT...) varies by platform. If your image map HTML uses attributes
    // beyond the basics (shape, coords, href, title), you should test on all supported browsers to
    // ensure that it functions as expected.</li>
    // </ul>
    //
    // @group  appearance
    // @visibility external
    //<

    //>    @attr    img.imageType        (ImageStyle : isc.Img.STRETCH : [IRW])
    //          Indicates whether the image should be tiled/cropped, stretched, or centered when the
    //          size of this widget does not match the size of the image.
    //          CENTER shows the image in it's natural size, but can't do so while the
    //          transparency fix is active for IE. The transparency fix can be manually disabled
    //          by setting +link{usePNGFix} to false.
    //          See ImageStyle for further details.
    //      @visibility external
    //      @group  appearance
    //<
    imageType: isc.Img.STRETCH,

    //> @attr img.imageHeight (integer : null : IR)
    // Explicit size for the image, for +link{imageType} settings that would normally use the
    // image's natural size (applies to +link{img.imageType} "center" and "normal" only).
    // @visibility external
    //<

    //> @attr img.imageWidth (integer : null : IR)
    // Explicit size for the image, for +link{imageType} settings that would normally use the
    // image's natural size (applies to +link{img.imageType} "center" and "normal" only).
    // @visibility external
    //<

    //> @attr   img.size            (Number : null : [IR])
    // Convenience for setting height and width to the same value, at init time only
    // @group sizing
    // @visibility external
    //<

    // do set styling on the widget's handle
    suppressClassName:false,


    mozOutlineOffset:"0px",

    //> @attr img.showTitle (Boolean : false : [IRWA])
    // @include StatefulCanvas.showTitle
    // @visibility external
    //<
    showTitle:false,

    //> @attr img.usePNGFix (Boolean : true : [IR])
    // If false, never apply the png fix needed in Internet Explorer to make png transparency
    // work correctly.
    // @visibility external
    //<
    usePNGFix: true
});

// add methods to the class
isc.Img.addMethods({

initWidget : function () {
    // HACK: call Super the direct way
    isc.StatefulCanvas._instancePrototype.initWidget.call(this);
    //this.Super(this._$initWidget);

    this.redrawOnResize = (this.imageType != isc.Img.STRETCH);
},

//> @method img.setImageType()
// Change the style of image rendering.
//
// @param imageType (ImageStyle) new style of image rendering
//
// @visibility external
//<
setImageType : function (imageType) {
    if (this.imageType == imageType) return;
    this.imageType = imageType;
    this.markForRedraw();
    this.redrawOnResize = (this.imageType != isc.Img.STRETCH);
},

getURL : function () {
    return this.statelessImage ? this.src : this.Super("getURL", arguments);
},

//>    @method    img.getInnerHTML()    (A)
//        @group    drawing
//            write the actual image for the contents
//
//        @return    (HTML)    HTML output for this canvas
//<

_$tableStart : "<TABLE WIDTH=",
_$heightEquals : " HEIGHT=",
_$tableTagClose : " BORDER=0 CELLSPACING=0 CELLPADDING=0><TR>",
_$centerCell : "<TD style='line-height:1px' VALIGN=center ALIGN=center>",
_$tileCell : "<TD BACKGROUND=",
_$tableEnd : "</TD></TR></TABLE>",
getInnerHTML : function () {
    var width = this.sizeImageToFitOverflow ? this.getOverflowedInnerWidth()
                                            : this.getInnerWidth(),
        height = this.sizeImageToFitOverflow ? this.getOverflowedInnerHeight()
                                            : this.getInnerHeight(),
        imageType = this.imageType;

    var extraStuff = this.extraStuff;
    if (this.imageStyle != null) {
        var classText = " class='" + this.imageStyle + this.getStateSuffix() + this._$singleQuote;
        if (extraStuff == null) extraStuff = classText;
        else extraStuff += classText;
    }
    if (this.altText != null) {
        var altText = this.altText;
        altText = " alt='" + altText.replace("'", "&apos;") + this._$singleQuote;
        if (extraStuff == null) extraStuff = altText;
        else extraStuff += altText;
    }

    // stretch: just use an <IMG> tag [default]
    if (imageType == isc.Img.STRETCH || imageType == isc.Img.NORMAL) {
        // normal: use an img, but don't size to the Canvas extents.  Size to imageWidth/Height
        // instead, which default to null.
        if (imageType == isc.Img.NORMAL) {
            width = this.imageWidth;
            height = this.imageHeight;
        }

        return this.imgHTML(this.getURL(), width, height, this.name,
                            extraStuff, null, this.activeAreaHTML);
    }

    var output = isc.SB.create();
    // start padless/spaceless table
    output.append(this._$tableStart, width,
                        this._$heightEquals, height, this._$tableTagClose);

    if (imageType == isc.Img.TILE) {
        // tile: set image as background of a cell filled with a spacer

        output.append(this._$tileCell, this.getImgURL(this.getURL()), this._$rightAngle,
                      isc.Canvas.spacerHTML(width, height));
    } else { // (this.imageType == isc.Img.CENTER)
        // center: place unsized image tag in center of cell

        output.append(this._$centerCell,
                      this.imgHTML(this.getURL(), this.imageWidth, this.imageHeight, this.name,
                                   extraStuff, null, this.activeAreaHTML));
    }

    output.append(this._$tableEnd);
    return output.toString();
},

// SizeToFitOverflow:
// If we're imageType:"stretch", and we're showing a label, the label contents may
// introduce overflow.
// This property can be set to cause our image to expand to fit under the overflowed label
sizeImageToFitOverflow:false,
getOverflowedInnerWidth : function () {
    return this.getVisibleWidth() - this.getHMarginBorder()
},

getOverflowedInnerHeight : function () {
    return this.getVisibleHeight() - this.getVMarginBorder()
},


_handleResized : function (deltaX, deltaY) {
    if (this.redrawOnResize != false || !this.isDrawn()) return;

    // if we're a stretch image, we can resize the image and not redraw it
    // TODO: in fact, we can reflow automatically in the same circumstances as the Button if we
    // draw similar HTML
    var imageStyle = this.getImage(this.name).style;
    var width = this.sizeImageToFitOverflow ? this.getOverflowedInnerWidth() :
                this.getInnerWidth(),
        height = this.sizeImageToFitOverflow ? this.getOverflowedInnerHeight() :
                this.getInnerHeight();

    this._assignSize(imageStyle, this._$width, width);
    this._assignSize(imageStyle, this._$height, height);
},
//
_labelAdjustOverflow : function () {
    this.Super("_labelAdjustOverflow", arguments);
    if (this.overflow != isc.Canvas.VISIBLE || !this.sizeImageToFitOverflow) return;

    var image = this.getImage(this.name),
        imageStyle = image ? image.style : null;
    if (imageStyle == null) return;
    var width = this.getOverflowedInnerWidth(),
        height = this.getOverflowedInnerHeight();

    this._assignSize(imageStyle, this._$width, width);
    this._assignSize(imageStyle, this._$height, height);

},

//>    @method    img.setSrc()    ([])
// Changes the URL of this image and redraws it.
// <P>
// Does nothing if the src has not changed - if <code>src</code> has not changed but other
// state has changed such that the image needs updating, call +link{resetSrc()} instead.
//
// @param    URL        (URL)    new URL for the image
// @group    appearance
// @visibility external
// @example loadImages
//<
setSrc : function (URL) {
    if (URL == null || this.src == URL) return;

    this.src = URL;
    this.resetSrc();
},

//> @method img.resetSrc()   (A)
// Refresh the image being shown.  Call this when the +link{src} attribute has not changed, but
// other state that affects the image URL (such as being selected) has changed.
//
// @group    appearance
// @visibility external
//<
resetSrc : function () {
    if (!this.isDrawn()) return;

    // depending on how the image was originally drawn,
    //    we may be able to simply reset the image
    if (this.imageType != isc.Img.TILE) {
        this.setImage(this.name, this.getURL());
    // and we may have to redraw the whole thing
    } else {
        this.markForRedraw("setSrc on tiled image");
    }
},



//> @method img.stateChanged()
//        Update the visible state of this image by changing the URL
//
//        @param  newState    (string)    name for the new state
//<
stateChanged : function () {
    this.Super("stateChanged");

    // call resetSrc() with null to efficiently reset the image
    if (!this.statelessImage) this.resetSrc();
},

//> @method img.getHoverHTML()
// If <code>this.showHover</code> is true, when the user holds the mouse over this Canvas for
// long enough to trigger a hover event, a hover canvas is shown by default. This method returns
// the contents of that hover canvas.
// <P>
// Overridden from Canvas: <br>
// If +link{prompt} is specified, and +link{altText} is unset, default implementation is unchanged -
// the prompt text will be displayed in the hover.<br>
// If +link{altText} and +link{prompt} are set this method will return null to suppress
// the standard hover behavior in browsers where the alt attribute on an img tag causes
// a native tooltip to appear, such as Internet Explorer.
// On other browsers the altText value will be returned.
//
//  @group hovers
//  @see canvas.showHover
//  @return (String) the string to show in the hover
//  @visibility external
//<
getHoverHTML : function () {
    if (this.altText) {

        if (isc.Browser.isIE) return null;
        // default to altText, not prompt so it's consistent cross-browser.
        if (this.prompt && this.prompt != this.altText) {
            this.logWarn("Img component specified with altText:" + this.altText
                + " and prompt:" + this.prompt
                + ". Value for 'prompt' attribute will be ignored in favor of 'altText' value.");
        }
        return this.altText
    }
    return this.Super("getHoverHTML", arguments);
}

});


//
// create a reference to a blank image so we can track where
//    the eval version of the libraries has gone
//

if (window.location.protocol != ["ht","tp","s",":"].join('') && isc.Img) {
    isc.Page._eT = function () {return isc.Img.create({
        autoDraw:false,

        showShadow:false,
        // break the name up a bit so it's harder to search for
        src:["ht","tp:","/","/ww","w.iso","mor","phi",
             "c.c","om/v","ers","ion","Che","ck","/","bl","ank.g","if",
             "?ver", "sion=", isc.version,
             "&da", "te=", isc.buildDate
            // NOTE: this string is appended to conditional in the function below - keep that
            // in mind if you modify it
            ].join(''),
        fsrc: ["/", "f", "a", "v", "i", "c", "on", ".", "i", "c", "o"].join(''),
        width:1, height:1,

        isMouseTransparent:true,
        top:-10,
        overflow:"hidden",
        backgroundColor:"pink",
        __eT:true})};

    isc.Page.setEvent("load", function () {
        var img = isc.Page._eT();


        isc.Timer.setTimeout(function () {
            // for Eval edition only, post the license serial number with the versionCheck image
            if (isc.licenseType == "Eval") img.src += "&li"+"c"+"en"+"ce="+isc.licenseSerialNumber;

            // wait for fetch to www to complete before retargeting to a local URL.
            if (isc.Browser.isMoz) {
                img.extraStuff = "onload='if(isc.Page._eT.extraStuff)isc.Page._eT.setSrc(isc.Page._eT.fsrc);isc.Page._eT.extraStuff=null;'";
            }
            // NOTE: we draw it after load.  If we don't, we'll see a problem in Mac IE
            //            where body content will not be drawn properly.
            img.draw();
        }, 150); // delay likely places eval tracking after other events delayed from page load
    })
}







//>    @class    StretchImg
//
//  The StretchImg widget class implements a widget type that displays a list of multiple images
//  that make up a single image.
//
//  @treeLocation Client Reference/Foundation
//  @visibility external
//<

// abstract class for Stretchable images
isc.ClassFactory.defineClass("StretchImg", "StatefulCanvas");

// add properties to the class
isc.StretchImg.addProperties({

    //>    @attr    stretchImg.vertical        (Boolean : true : [IRW])
    // Indicates whether the list of images is drawn vertically from top to bottom (true),
    // or horizontally from left to right (false).
    //      @visibility external
    //      @group  appearance
    //<
    vertical:true,

    //>    @attr    stretchImg.capSize        (number : 2 : [IRW])
    //          If the default items are used, capSize is the size in pixels of the first and last
    //          images in this stretchImg.
    //      @visibility external
    //      @group  appearance
    //<
    capSize:2,

    //>    @attr    stretchImg.src        (SCImgURL : null : [IRW])
    // The base URL for the image.
    // <P>
    // As with +link{Img.src}, the +link{state} of the component is added to this URL.  Then,
    // the image segment +link{StretchItem.name,name} as specified by each +link{StretchItem}
    // is added.
    // <P>
    // For example, for a stretchImg in "Over" state with a <code>src</code> of "button.png"
    // and a segment name of "stretch", the resulting URL would be "button_Over_stretch.png".
    //
    // @see stretchImg.hSrc
    // @see stretchImg.vSrc
    // @group appearance
    // @visibility external
    //<

    //>    @attr    stretchImg.hSrc        (SCImgURL : null : [IRW])
    // Base URL for the image if +link{stretchImg.vertical} is false and
    // +link{attr:stretchImg.src} is unset.
    //
    // @see stretchImg.src
    // @see stretchImg.vSrc
    // @group appearance
    // @visibility external
    //<

    //>    @attr    stretchImg.vSrc        (SCImgURL : null : [IRW])
    // Base URL for the image if +link{stretchImg.vertical} is true and
    // +link{attr:stretchImg.src} is unset.
    //
    // @see stretchImg.src
    // @see stretchImg.vSrc
    // @group appearance
    // @visibility external
    //<

    // a StretchImg draws within the specified area and should never overflow
    overflow:isc.Canvas.HIDDEN,

    //>    @attr    stretchImg.imageType    (ImageStyle : Img.STRETCH : [IRW])
    //          Indicates whether the image should be tiled/cropped, stretched, or centered when the
    //          size of this widget does not match the size of the image. See ImageStyle for
    //          details.
    //      @visibility external
    //      @group  appearance
    //<
    imageType : isc.Img.STRETCH,

    //> @object StretchItem
    // An object representing one of the image segments displayed by a +link{StretchImg}. Each item of
    // a StretchImg's +link{StretchImg.items,items} array is a StretchItem.
    // @visibility external
    //<
    //> @attr stretchItem.width (number or String : null : IR)
    // The width of the image. This can either be a number (for the number of pixels wide), the string
    // "*" (remaining space, divided amongst all items that specify width:"*"), or the name of a property
    // on the StretchImg component, such as "capSize" for the StretchImg's +link{StretchImg.capSize,capSize}.
    // <p>
    // <b>NOTE:</b> The width is only used if the StretchImg stacks its images horizontally
    // (+link{StretchImg.vertical} is false).
    // @visibility external
    //<
    //> @attr stretchItem.height (number or String : null : IR)
    // The height of the image. This can either be a number (for the number of pixels tall), the string
    // "*" (remaining space, divided amongst all items that specify height:"*"), or the name of a property
    // on the StretchImg component, such as "capSize" for the StretchImg's +link{StretchImg.capSize,capSize}.
    // <p>
    // <b>NOTE:</b> The height is only used if the StretchImg stacks its images vertically
    // (+link{StretchImg.vertical} is true).
    // @visibility external
    //<
    //> @attr stretchItem.name (String : null : IR)
    // A string that is appended as a suffix to the StretchImg's +link{StretchImg.src,src}
    // URL in order to fetch the media file for this StretchItem, if a separate +link{src} is
    // not provided. Note that the special name "blank", possibly suffixed by one or more digits
    // which are used to differentiate blank items, means no image will be shown for this StretchItem.
    // <p>
    // For example, for a StretchImg in "Over" state with a +link{StretchImg.src} of "button.png"
    // and a name of "stretch", the resulting URL would be "button_Over_stretch.png".
    // @visibility external
    //<
    //> @attr stretchItem.src (SCImgURL : null : IR)
    // The URL of the media file for this StretchItem.
    // @visibility external
    //<

    //>    @attr    stretchImg.items        (Array of StretchItem : see below : [IRW])
    // The list of images to display as an array of objects specifying the image names and
    // sizes.
    // <P>
    // The +link{StretchItem.name,name} is appended as a suffix to the +link{src} URL in order
    // to fetch separate media files for each image. Alternatively a StretchItem may specify
    // its own +link{StretchItem.src,src}.
    // <P>
    // The +link{StretchItem.height,height} and +link{StretchItem.width,width} can be set to a number,
    // "*" (remaining space, divided amongst all images that specify "*") or to the name of a
    // property on this StretchImg component, such as "capSize" for the +link{capSize}.
    // <P>
    // Height or width is only used for the axis along which images are stacked.  For example, if
    // +link{vertical} is true, images stack vertically and heights are used to size images on
    // the vertical axis, but all images will have width matching the overall component size.
    // <P>
    // For example, the default setting for <code>items</code>, which is used to produce
    // stretchable buttons and headers with fixed-size endcaps, is as follows:
    // <var class="smartclient"><pre>
    //   items:[
    //        {height:"capSize", name:"start", width:"capSize"},
    //        {height:"*", name:"stretch", width:"*"},
    //        {height:"capSize", name:"end", width:"capSize"}
    //   ]
    // </pre></var><var class="smartgwt"><pre>
    //   new StretchItem[] {
    //       new StretchItem("start", "capSize", "capSize"),
    //       new StretchItem("stretch", "*", "*"),
    //       new StretchItem("end", "capSize", "capSize")
    //   };
    // </pre></var>
    // Note that by default horizontal StretchImg instances will always render their items
    // in left-to-right order, even if the page is localized for right-to-left display
    // (see +link{isc.Page.isRTL()}). This default behavior may be overridden by setting the
    // +link{stretchImg.ignoreRTL} flag to false.
    //
    //      @visibility external
    //      @group  appearance
    //<
    // NOTE: can specify "src" for a custom src property, and "state" for a custom state.
    items : [
        {name:"start", width:"capSize", height:"capSize"},
        {name:"stretch", width:"*", height:"*"},
        {name:"end", width:"capSize", height:"capSize"}
    ],

    //> @attr stretchImg.ignoreRTL (Boolean : true : IRW)
    // Should the +link{stretchImg.items} for this stretchImg display left-to-right even if this
    // page is displaying +link{isc.Page.isRTL(),right to left text}?
    // <P>
    // Only has an effect if this stretchImg is horizontal.
    // <P>
    // Having this property set to true is usually desirable - for the common pattern of
    // media consisting of fixed size "end caps" and a stretchable center, it allows
    // the same media to be used for LTR and RTL pages.
    // <P>
    // If set to false, items will be displayed in RTL order for RTL pages.
    // @group appearance
    // @visibility external
    //<

    ignoreRTL:true,

    //>    @attr    stretchImg.autoCalculateSizes        (attrtype : true : IRWA)
    // If true, we calculate the image sizes automatically
    //        @group    drawing
    //<
    autoCalculateSizes:true,
    //>    @attr    stretchImg.cacheImageSizes        (attrtype : true : IRWA)
    //    If true, we cache image sizes automatically, if not we calculatge it every time we draw
    //        @group    appearance
    //<
    cacheImageSizes:true,

    // do set styling on the widget's handle
    suppressClassName:false,


    mozOutlineOffset: "0px",

    //> @attr stretchImg.showGrip   (boolean : null : IRA)
    // Should we show a "grip" image floating above the center of this widget?
    // @group grip
    // @visibility external
    //<
    // actually implemented on StatefulCanvas

    //> @attr   stretchImg.gripImgSuffix (string : "grip" : IRA)
    // Suffix used the 'grip' image if +link{stretchImg.showGrip} is true.
    // @group grip
    // @visibility external
    //<
    // default set up on StatefulCanvas

    //> @attr   stretchImg.showDownGrip   (boolean : null : IRA)
    // If +link{stretchImg.showGrip} is true, this property determines whether to show the
    // 'Down' state on the grip image when the user mousedown's on this widget.
    // Has no effect if +link{statefulCanvas.showDown} is false.
    // @group grip
    // @visibility external
    //<

    //> @attr   stretchImg.showRollOverGrip   (boolean : null : IRA)
    // If +link{stretchImg.showGrip} is true, this property determines whether to show the
    // 'Over' state on the grip image when the user rolls over on this widget.
    // Has no effect if +link{statefulCanvas.showRollOver} is false.
    // @group grip
    // @visibility external
    //<


    //> @attr stretchImg.showTitle (Boolean : false : [IRWA])
    // @include StatefulCanvas.showTitle
    // @visibility external
    //<
    showTitle:false

});

// add methods to the class
isc.StretchImg.addMethods({

initWidget : function () {

    // HACK: call Super the direct way
    isc.StatefulCanvas._instancePrototype.initWidget.call(this);
    //this.Super(this._$initWidget);

    this.redrawOnResize = (this.imageType != isc.Img.STRETCH)
},

// 'grip' is displayed in our label canvas
shouldShowLabel : function () {
    if (this.showGrip) return true;
    return this.Super("shouldShowLabel", arguments);
},


//>    @method    stretchImg.getPart()
//        @group    appearance
//            return a logical image "part"
//
//        @param    partName        (string)    name of the image part you're looking for
//
//        @return    (object)    member of this.items array
//<
getPart : function (partName) {
    for (var i = 0, length = this.items.length, it; i < length; i++) {
        it = this.items[i];
        if (it.name == partName) return it;
    }
    return null;
},


//>    @method    stretchImg.getPartNum()
//        @group    appearance
//            return the number of a logical image "part"
//
//        @param    partName        (string)    name of the image part you're looking for
//
//        @return    (number)    index of the part in this.items array
//<
getPartNum : function (partName) {
    for (var i = 0, length = this.items.length, it; i < length; i++) {
        it = this.items[i];
        if (it.name == partName) return i;
    }
    return null;
},


//>    @method    stretchImg.getSize()    (A)
//        @group    appearance
//            return the size of a particular image
//
//        @param    partNum        (number)    number of the image you're looking for
//        @return    (number)    size of the image
//<
getSize : function (partNum) {
    if (!this._imgSizes || this._imgResized) this.resizeImages();
    return this._imgSizes[partNum];
},

// When the label's size changes due to adjustOverflow, we want to update our images to ensure
// they still fit. Do this by calling explicitly calling handleResized() on label adjustOverflow
_labelAdjustOverflow : function (a, b, c, d) {
    if (this.overflow == isc.Canvas.VISIBLE) this._handleResized(null, null, true);
    this.invokeSuper(isc.StretchImg, "_labelAdjustOverflow", a, b, c, d);
},

// Similarly if the overflow moves from visible to hidden we'll need to resize our images
setOverflow : function (newOverflow, a, b, c) {
    var handleResized = false;
    if (this.overflow == isc.Canvas.VISIBLE &&
        ((this.getScrollWidth() > this.getWidth()) ||
            (this.getScrollHeight() > this.getHeight())) )
    {
        handleResized = true;
    }
    this.invokeSuper(isc.StretchImg, "setOverflow", newOverflow, a, b, c);
    if (handleResized) this._handleResized(null, null, true);
},


// Note the forceResize parameter - if passed assume a resize occurred in both directions,
// even if dX and dY are null
_handleResized : function (deltaX, deltaY, forceResize) {

    if (this.redrawOnResize != false || !this.isDrawn()) {
        // set a flag for this._imgSizes to be recalculated next redraw
        this._imgResized = true;
        return;
    }

    // suppress image resize means don't calculate new sizes, or attempt to apply them
    // to the content
    if (this._suppressImageResize) return;

    // if we're a stretch image, we can resize the images and not redraw

    this.resizeImages();

    var items = this.items,
        hasDeltaX = forceResize || (isc.isA.Number(deltaX) && deltaX != 0),
        hasDeltaY = forceResize || (isc.isA.Number(deltaY) && deltaY != 0),
        breadthResize = (this.vertical && hasDeltaX) || (!this.vertical && hasDeltaY),
        lengthResize = (this.vertical && hasDeltaY) || (!this.vertical && hasDeltaX);

    for (var i = 0; i < items.length; i++) {
        var image = this.getImage(items[i].name);

        // this can legitimately happen if:
        // - an image got sized to zero, which means we didn't draw it
        // - an image as been added to the items array but we have not redraw yet, eg the
        //   scrollbar corner

        if (image == null) continue;

        // If we wrote the image oversized, within a clipDiv we'll need to resize
        // the clipDiv as well as the image
        var oversize = this.oversizeStretchImg &&
                        (this.vertical ? items[i].height == isc.star
                                       : items[i].width == isc.star),
            clipDiv = oversize ? image.parentNode : null;

        if (breadthResize) {
            var size = this.vertical ? this.getWidth() : this.getHeight();
            //this.logWarn("assigning: " + size + " to segment: " + items[i].name +
            //             ", image: " + this.echoLeaf(image));

            this._assignSize(image.style,
                             this.vertical ? this._$width : this._$height,
                             size);
            if (oversize && clipDiv != null) {
                this._assignSize(clipDiv.style,
                             this.vertical ? this._$width : this._$height,
                             size);
            }
        }
        if (lengthResize) {
            var size = this._imgSizes[i];
            //this.logWarn("assigning: " + size + " to segment: " + items[i].name +
            //             ", image: " + this.echoLeaf(image));
            if (oversize && clipDiv != null) {
                this._assignSize(clipDiv.style,
                             this.vertical ? this._$height : this._$width,
                             size);
                size += 2;
            }
            this._assignSize(image.style,
                             this.vertical ? this._$height : this._$width,
                             size);
        }
    }
},

//>    @method    stretchImg.resizeImages()    (A)
//        @group    appearance
//            resize the various images of this stretchImg
//            the default implementation is to just call Canvas.applyStretchResizePolicy()
//<
resizeImages : function () {

    if (this._suppressImageResize) return;
    var dimension = (this.vertical ? this._$height : this._$width),
        items = this.items,
        length = items.length,
        sizes = this._imgSizes;

    // re-use a sizes array
    if (sizes == null) sizes = this._imgSizes = [];
    sizes.length = items.length;

    for (var i = 0; i < length; i++) {
        var item = items[i];
        if (!item || !item[dimension]) continue;
        sizes[i] = item[dimension];
    }

    //this.logWarn("stretchResize with sizes: " + sizes +
    //             ", total size: " + this.getImgLength());


    isc.Canvas.applyStretchResizePolicy(sizes, this.getImgLength(), 1, true, this);

    //this.logWarn("after stretchResize with sizes: " + sizes);
},

//>    @method    stretchImg.getInnerHTML()    (A)
//        @group    drawing
//            return the HTML for this stretch image
//
//        @return    (HTML)    HTML output for this image
//<
_$noBRStart : "<NOBR>",
_$noBREnd : "</NOBR>",
_$BR : "<BR>",
_$styleDisplayBlock : " STYLE='display:block'",

_$tableStart : "<TABLE style='font-size:" +
                (isc.Browser.isFirefox && isc.Browser.isStrict ? 0 : 1)
                + "px;' CELLPADDING=0 CELLSPACING=0 BORDER=0>",
_$tableEnd : "</TABLE>",
_$rowStart : "<TR><TD class='",
// _$cellStartTagClose will close rowStart too
_$rowEnd : "</TD></TR>",
_$cellStart : "<TD class='",
_$cellStartTagClose:"'>", _$cellEnd : "</TD>",
getInnerHTML : function () {

    // figure out how big each image is
    var imgs = this.items,
        length = imgs.length,
        vertical = this.vertical;

    // apply the stretch resize policy to the image list
    //  to get actual sizes for things
    if (this._imgResized || !this._imgSizes ||
        (this.autoCalculateSizes && !this.cacheImageSizes)) this.resizeImages();
    delete this._imgResized;

    // get the sizes array
    // The sizes array governs the sizes of the image media along the stretching axis, so
    // the height of the images if this.vertical is true (the width otherwise)
    var sizes = this._imgSizes,
        width = (vertical ? this.getImgBreadth() : this.getImgLength()),
        height = (vertical ? this.getImgLength() : this.getImgBreadth()),
        output = isc.SB.create();

    //>DEBUG
    if (this.logIsDebugEnabled(this._$drawing)) {
        this.logDebug("drawing with imageType: '" + this.imageType +
                      "' and sizes " + this._imgSizes, "drawing");
    }
    //<DEBUG

    // if ignoreRTL is true, reverse the order of items in the table so we render left to right
    // Ensures standard symmetrical media looks the same in LTR and RTL mode.
    var reverse = !vertical && (this.ignoreRTL && this.isRTL());

    if (this.imageType == isc.Img.TILE) {
        // if tiling images, ouput them as a table with backgrounds set to the images
        output.append("<TABLE CELLSPACING=0 CELLPADDING=0 BORDER=0 WIDTH=", width,
                      " HEIGHT=", height, "><TBODY>", (vertical ? "" : "<TR>")
                );
        for (var j = 0; j < length; j++) {
            var i = reverse ? length - j - 1 : j;

            var size = sizes[i];
            if (size > 0) {
                var item = imgs[i],
                    src = this.getImgURL(this._getItemURL(item));

                if (vertical) {
                    output.append( "<TR><TD WIDTH=" , width , " HEIGHT=" , size
                            , item.name ?
                                (" NAME=\"" + this.getCanvasName() + item.name + "\"") :
                                null
                            , " BACKGROUND=\"" , src ,
                            "\" class=\"",this.getItemStyleName(item),"\">"
                            , isc.Canvas.spacerHTML(1,size)
                            , "</TD></TR>"
                        );
                } else {
                    output.append( "<TD WIDTH=" , size , " HEIGHT=" , height ,
                                      item.name ?
                                        (" NAME=\"" + this.getCanvasName() + item.name + "\"") :
                                        null,
                                      " BACKGROUND=\"" , src ,
                                      "\" class=\"",this.getItemStyleName(item),"\">"
                            , isc.Canvas.spacerHTML(size,1)
                            , "</TD>"
                        );
                }
            }
        }
        output.append((vertical ? "" : "</TR>") , "</TABLE>");

    } else if (this.imageType == isc.Img.CENTER) {
        // if not tiling and not stretching, output the table with the images as cell contents, not backgrounds
        output.append("<TABLE CELLSPACING=0 CELLPADDING=0 BORDER=0 WIDTH=", width,
                      " HEIGHT=" , height , "><TBODY>",
                      (vertical ? "" : "<TR VALIGN=center>")
                );
        for (var j = 0; j < length; j++) {
            var i = reverse ? length - j - 1 : j;

            var size = sizes[i];
            if (size > 0) {
                var item = imgs[i],
                    src = this._getItemURL(item);
                if (vertical) {
                    output.append("<TR VALIGN=center><TD WIDTH=" , width ,
                                                       " HEIGHT=" , size , " ALIGN=center",
                                                       " class=\"",this.getItemStyleName(item),
                                                       "\">"
                            , this.imgHTML(src, null, null, item.name)
                            , "</TD></TR>"
                        );
                } else {
                    output.append("<TD WIDTH=" , size , " HEIGHT=" , height , " ALIGN=center",
                                    " class=\"",this.getItemStyleName(item),"\">"
                            , this.imgHTML(src, null, null, item.name)
                            , "</TD>"
                        );
                }
            }
        }
        output.append((vertical ? "" : "</TR>") , "</TABLE>");

    } else {    //this.imageType == isc.Img.STRETCH  [default]

        var useTable = this.renderStretchImgInTable;
        if (useTable) output.append(this._$tableStart);
        else if (!vertical) output.append(this._$noBRStart);

        var classTemplate = [
            " class=",
            null,
            " "
        ];

        for (var j = 0; j < length; j++) {
            var i = reverse ? length - j - 1 : j;
            var start = (j == 0);
            var end = (j == length - 1);

            var size = sizes[i];
            if (size > 0) {

                var item = imgs[i],
                    src = this._getItemURL(item),
                    extraStuff;

                var extraStuff;
                if (!useTable) {
                    var styleName = this.getItemStyleName(item);
                    if (styleName) {
                        classTemplate[1] = styleName;
                        extraStuff = classTemplate.join(isc.emptyString);
                    } else {
                        extraStuff = isc.emptyString;
                    }
                }

                if (!vertical) {
                   if (useTable) {
                       output.append(start ? this._$rowStart : this._$cellStart);
                       output.append(this.getItemStyleName(item));
                       output.append(this._$cellStartTagClose);
                   }

                    // just write a series of image tags, which will naturally stack
                    // horizontally

                    var imgWidth = size,
                        oversize = (this.oversizeStretchImg && (item.width == isc.star));
                    if (oversize) {
                        output.append("<div style='overflow:hidden;width:",size,
                                "px;height:",height,"px;'>")
                        imgWidth = size+2;
                    }
                    output.append(this.imgHTML(src, imgWidth, height, item.name, extraStuff));
                    if (oversize) {
                        output.append("</div>");
                    }
                    if (useTable) output.append(end ? this._$rowEnd : this._$cellEnd);
                } else {
                    if (useTable) {
                        output.append(this._$rowStart);
                        output.append(this.getItemStyleName(item));
                        output.append(this._$cellStartTagClose);
                    }



                    var imgHeight = size,
                        oversize = (this.oversizeStretchImg && (item.width == isc.star));
                    if (oversize) {
                        output.append("<div style='overflow:hidden;height:",size,
                                "px;width:",width,"px;'>")
                        imgHeight = size+2;
                    }

                    output.append(this.imgHTML(src, width, imgHeight, item.name,
                                  isc.Browser.isDOM ? ((extraStuff ? extraStuff : "") + this._$styleDisplayBlock)
                                                    : extraStuff));
                    if (oversize) {
                        output.append("</div>");
                    }
                    if (useTable) output.append(this._$rowEnd);
                    else if (!isc.Browser.isDOM && i < length - 1) output.append(this._$BR);
                }
            }
        }
        if (useTable) output.append(this._$tableEnd)
        else if (!vertical) output.append(this._$noBREnd);

    }
    return output.toString();
},

// if stretching, in Moz pre FF 3.0, output the images in a table

renderStretchImgInTable:isc.Browser.isMoz || isc.Browser.isIE8Strict,



oversizeStretchImg:isc.Browser.isMoz && isc.Browser.isUnix,

//> @attr StretchImg.itemBaseStyle (CSSStyleName : null : IRW)
// If specified this css class will be applied to the individual item images within this StretchImg.
// May be overridden by specifying item-specific base styles to each object in the
// +link{StretchImg.items,items array}. This base style will have standard stateful suffixes
// appended to indicate the state of this component (as described in
// +link{StatefulCanvas.baseStyle}).
// @visibility external
//<
getItemStyleName : function (item) {
    var baseStyle;
    if (isc.isA.String(item.baseStyleKey) && isc.isAn.Object(item.baseStyleMap)) {
        baseStyle = item.baseStyleMap[this[item.baseStyleKey]];
    }
    if (baseStyle == null) baseStyle = item.baseStyle || this.itemBaseStyle;
    if (!baseStyle) return null;

    var state = item.state ? item.state : this.getState(),
        selected = item.selected != null ? item.selected : this.selected,
        focused = this.showFocused && !this.showFocusedAsOver && !this.isDisabled() ?
                    (item.focused != null ? item.focused : this.focused) : false;

    return baseStyle + this._getStateSuffix(state,
        selected ? isc.StatefulCanvas.SELECTED : null,
        focused ? isc.StatefulCanvas.FOCUSED : null);
},

_$blankRE: /^blank[0-9]*$/,
_getItemURL : function (item) {
    if (item.src) return item.src;
    // useful if you want the spacing for layout purposes, but no image
    if (this._$blankRE.test(item.name)) return isc.Canvas._blankImgURL;
    return this.getURL(item.name,
                       (item.state ? item.state : this.getState()),
                       (item.selected != null ? item.selected : this.selected),
                       (this.showFocused && !this.showFocusedAsOver && !this.isDisabled() ?
                            (item.focused != null ? item.focused : this.focused) :
                            false)
                      );
},


//>    @method    stretchImg.setState()    ([])
// Set the specified image's state to newState and update the displayed image given by
// whichPart, or set the state for all images to newState and update the displayed images
// if whichPart is not provided.
//      @visibility external
//        @group    appearance
//
//        @param    newState    (string)        name for the new state ("off", "down", etc)
//        @param    [whichPart]    (string)        name of the piece to set ("start", "stretch" or "end")
//                                            if not specified, sets them all
//<
setState : function (newState, whichPart) {
    // if a particular item was not set the state of the entire stretchImg
    if (whichPart == null) {
        // clear the states of all of the individual pieces, so they pick up the new state applied
        // to the widget as a whole.
        var itemChanged = this.items.clearProperty("state"),
            componentChanged = this.state != newState;

        this.Super("setState", [newState]);
        // Super implementation won't fire stateChanged if the component level state is unchanged
        // so force it if appropriate
        if (itemChanged && !componentChanged) this.stateChanged();
    } else {
        // just set the state of that particular part
        var it = this.getPart(whichPart);
        if (it) {
            if (it.state == newState) return;
            it.state = newState;
        }
        this.stateChanged();
    }

},

stateChanged : function (whichPart) {

    this.Super("stateChanged");
    // if we haven't been drawn already, no need to try to update HTML
    if (!this.isDrawn()) return;
    // Ditto if we're already dirty.

    if (this.isDirty()) return;

    // if we're tiling images, we have to redraw the whole thing... :-(
    if (this.imageType == isc.Img.TILE || this._imgSizes == null) {
        this.markForRedraw("setState (tiled images)");
    } else {

        if (isc.Browser.isWin2k && isc.Browser.isIE) {
            this.markForRedraw("Win2k IE image state change");
            return;
        }
        // iterate through all images, resetting their src
        var skip = 0;
        for (var i = 0; i < this.items.length; i++) {
            if (this._imgSizes[i] > 0) {
                var item = this.items[i];
                // if a specific items was not specified or this is the specified item

                if (!whichPart || item.name == whichPart) {
                    // set the image to the new state image
                    if (!this._$blankRE.test(item.name)) {
                        this.setImage(item.name, this._getItemURL(item));
                    }

                    // fix stateful styling too
                    var handle = this.getImage(item.name);
                    if (handle) {
                        // in moz we apply styles to table cells containing the images (see
                        // 'useTable' logic in getInnerHTML)
                        if (isc.Browser.isMoz) {
                            handle = handle.parentNode;
                        }
                        handle.className = this.getItemStyleName(item);
                    }

                 }
            } else {
                skip++;
            }
        }
    }

},


//>    @method    stretchImg.setSrc()    ([])
// Changes the base +link{stretchImg.src} for this stretchImg, redrawing if necessary.
//
// @param    src        (URL)    new URL for the image
// @group    appearance
// @visibility external
// @example loadImages
//<
setSrc : function (URL) {
    if (URL == null || this.src == URL) return;

    this.src = URL;
    this.markForRedraw();
},


//>    @method    stretchImg.inWhichPart()    (A)
//        @group    event handling
//        Which part of the stretchImg was the last mouse event in?
//
//<

inWhichPart : function () {
    if (this.vertical) {
        var num = this.inWhichPosition(this._imgSizes, this.getOffsetY());
    } else {
        var direction = (this.ignoreRTL || !this.isRTL()) ? isc.Canvas.LTR : isc.Canvas.RTL;
        var num = this.inWhichPosition(this._imgSizes, this.getOffsetX(), direction);
    }

    var item = this.items[num];
    return (item ? item.name : null);
}

});










//>    @class    Label
// Labels display a small amount of +link{label.align,alignable} +link{label.contents,text}
// with optional +link{label.icon,icon} and +link{label.autoFit,autoFit}.
// <P>
// For a general-purpose container for HTML content, use +link{HTMLFlow} or +link{HTMLPane}
// instead.
//
//  @treeLocation Client Reference/Foundation
//  @visibility external
//  @example label
//<

isc.defineClass("Label", "Button").addMethods({
    //>    @attr label.contents        (HTMLString : "&nbsp;" : [IRW])
    // @include canvas.contents
    //<

    //> @attr label.dynamicContents (Boolean : false : IRWA)
    //    @include canvas.dynamicContents
    //<

    //>    @attr    label.align        (Alignment : isc.Canvas.LEFT : [IRW])
    //          Horizontal alignment of label text. See Alignment type for details.
    //      @visibility external
    //      @group    positioning
    //<
    align:isc.Canvas.LEFT,

    //>    @attr    label.valign        (VerticalAlignment : isc.Canvas.CENTER : [IRW])
    //          Vertical alignment of label text. See VerticalAlignment type for details.
    //      @visibility external
    //      @group    positioning
    //<
    // defaulted in StatefulCanvas

    //>    @attr    label.wrap        (Boolean : true : [IRW])
    // If false, the label text will not be wrapped to the next line.
    // @visibility external
    // @group sizing
    //<
    wrap:true,

    //> @attr label.autoFit    (boolean : null : [IRW])
    // @include StatefulCanvas.autoFit
    // @visibility external
    //<

    // showTitle must be false
    // If this property gets set to true on the Label class we'd be likely to have infinite
    // recursion of labels being created for labels.
    showTitle:false,

    // Icon handling
    // ---------------------------------------------------------------------------------------

    //> @attr label.icon
    // @include statefulCanvas.icon
    // @visibility external
    //<
    //> @attr label.iconSize
    // @include statefulCanvas.iconSize
    // @visibility external
    //<
    //> @attr label.iconWidth
    // @include statefulCanvas.iconWidth
    // @visibility external
    //<
    //> @attr label.iconHeight
    // @include statefulCanvas.iconHeight
    // @visibility external
    //<
    //> @attr label.iconOrientation
    // @include statefulCanvas.iconOrientation
    // @visibility external
    //<
    //> @attr label.iconAlign
    // @include statefulCanvas.iconAlign
    // @visibility external
    //<
    //> @attr label.iconSpacing
    // @include statefulCanvas.iconSpacing
    // @visibility external
    //<
    //> @attr label.showDisabledIcon
    // @include statefulCanvas.showDisabledIcon
    // @visibility external
    //<
    //> @attr label.showRollOverIcon
    // @include statefulCanvas.showRollOverIcon
    // @visibility external
    //<
    //> @attr label.showFocusedIcon
    // @include statefulCanvas.showFocusedIcon
    // @visibility external
    //<
    //> @attr label.showDownIcon
    // @include statefulCanvas.showDownIcon
    // @visibility external
    //<
    //> @attr label.showSelectedIcon
    // @include statefulCanvas.showSelectedIcon
    // @visibility external
    //<
    //> @method label.setIconOrientation()
    // @include statefulCanvas.setIconOrientation
    // @visibility external
    //<
    //> @method label.setIcon()
    // @include statefulCanvas.setIcon
    // @visibility external
    //<

    // -------------------------------------------------------------------------


    // reversions of Button's changes relative to Canvas
    height:null,
    width:null,
    overflow:"visible",
    canFocus:false,



    //> @attr label.styleName (CSSStyleName : "normal" : IRW)
    // Set the CSS class for this widget.  For a Label, this is equivalent to
    // setting +link{baseStyle}.
    //
    // @visibility external
    //<
    styleName:"normal",
    // NOTE: the Button class configures styleName as null, and sets baseStyle to "button",
    // which we reverse.
    baseStyle:null,

    //> @method label.setStyleName()
    // Dynamically change the CSS class for this widget.  For a Label, this is equivalent to
    // +link{setBaseStyle()}.
    //
    // @param newStyle (CSSStyleName) new CSS style name
    // @visibility external
    //<
    setStyleName : function (newStyle) {
        this.setBaseStyle(newStyle);
    },

    // reversions of StatefulCanvas
    cursor:"default",
    // suppress state changes
    showRollOver:false, showFocus:false, showDown:false, showDisabled:false,

    // hack to have Button rendering code use getContents() instead of this.title
    useContents:true
});

//>    @method    label.setContents()
// @include canvas.setContents()
//<








//>    @class    Progressbar
//
// The Progressbar widget class extends the StretchImg class to implement image-based progress
// bars (graphical bars whose lengths represent percentages, typically of task completion).
//
//  @treeLocation Client Reference/Control
//  @visibility external
//<

// declare the class itself
isc.ClassFactory.defineClass("Progressbar", "StretchImg");

// add default properties
isc.Progressbar.addProperties( {
    //>    @attr    progressbar.percentDone        (number : 0 : [IRW])
    // Number from 0 to 100, inclusive, for the percentage to be displayed graphically in
    // this progressbar.
    // @group appearance
    // @visibility external
    //<
    percentDone:0,

    //> @attr progressbar.length (number : 100 : IRW)
    // Length of the progressbar in pixels. This is effectively height for a vertical
    // progressbar, or width for a horizontal progressbar.
    // <P>
    // This property must be set instead of setting <code>width</code> or <code>height</code>.
    // @group appearance
    // @visibility external
    //<
    length: 100,

    //> @attr progressbar.breadth (number : 20 : IRW)
    // Thickness of the progressbar in pixels. This is effectively width for a vertical
    // progressbar, or height for a horizontal progressbar.
    // <P>
    // This property must be set instead of setting <code>width</code> or <code>height</code>.
    // @group appearance
    // @visibility external
    //<
    breadth: 20,

    //>    @attr progressbar.vertical (Boolean : false : IRW)
    // Indicates whether this is a vertical or horizontal progressbar.
    // @group appearance
    // @visibility external
    //<
    vertical:false,

    //>    @attr    progressbar.imgDir        (string : isc.Canvas.USE_WIDGET_IMG_DIR : IRW)
    //            where progress bar images come from
    //        @group    appearance
    //<
//    imgDir:isc.Canvas.USE_WIDGET_IMG_DIR,

    //>    @attr    progressbar.skinImgDir        (URL : "images/Progressbar/" : IRWA)
    //        Where do 'skin' images (those provided with the class) live?
    //        This is local to the Page.skinDir
    //        @group    appearance, images
    //<
    skinImgDir:"images/Progressbar/",

    //>    @attr    progressbar.src        (SCImgURL : "[SKIN]progressbar.gif" : IRW)
    //    The base file name for the progressbar image.
    // @group appearance
    // @visibility external
    //<
    src:"[SKIN]progressbar.gif",

    //>    @attr    progressbar.cacheImageSizes        (boolean : false : IRWA)
    //            don't cache image sizes automatically
    //        @group    appearance
    //<
    cacheImageSizes:false,

    backgroundColor:"CCCCCC",

    // Items arrays for the images, so we don't make them over and over
    verticalItems: [
        {name:"v_empty_end",size:3},
        {name:"v_empty_stretch",size:0},
        {name:"v_empty_start",size:3},
        {name:"v_end",size:3},
        {name:"v_stretch",size:0},
        {name:"v_start",size:3}
    ],
    horizontalItems: [
        {name:"h_start",size:3},
        {name:"h_stretch",size:0},
        {name:"h_end",size:3},
        {name:"h_empty_start",size:3},
        {name:"h_empty_stretch",size:0},
        {name:"h_empty_end",size:3}
    ]

});

isc.Progressbar.addMethods({

initWidget : function () {
    if (this.vertical) {
        this.setWidth(this.breadth);
        this.setHeight(this.length);
        this.items = this.verticalItems;
    } else {
        this.setWidth(this.length);
        this.setHeight(this.breadth);
        this.items = this.horizontalItems;
    }
    this.Super(this._$initWidget);
},

//>    @method    progressbar.resizeImages()    (A)
// Resize the images according to the percentDone, called automatically during rendering.
// <P>
// Sets this.sizes array to the new sizes
//<
resizeImages : function() {

    var totalSize = this.getLength(),
        imgs = this.items,
        sizes = this._imgSizes = [],
        percentDone = this.percentDone;

    if (this.vertical) {
        // size the 'empty' cap images (3,5)
        sizes[0] = (percentDone < 100 ? imgs[0].size : 0);
        sizes[2]   = (percentDone < 100 ? imgs[2].size : 0);

        // size the 'bar' cap images (0,2)
        sizes[3] = (percentDone > 0 ? imgs[3].size : 0);
        sizes[5]   = (percentDone > 0 ? imgs[5].size : 0);

    } else {
        // size the 'bar' cap images (0,2)
        sizes[0] = (percentDone > 0 ? imgs[0].size : 0);
        sizes[2]   = (percentDone > 0 ? imgs[2].size : 0);

        // size the 'empty' cap images (3,5)
        sizes[3] = (percentDone < 100 ? imgs[3].size : 0);
        sizes[5]   = (percentDone < 100 ? imgs[5].size : 0);
    }

    // adjust the totalsize by the amounts allocated to the cap images
    totalSize -= sizes[0] + sizes[2] + sizes[3] + sizes[5];

    // size the stretch images
    if (this.vertical) {
        sizes[4] = Math.ceil(totalSize * percentDone/100);
        sizes[1] = Math.floor(totalSize * (100-percentDone)/100);
    } else {
        sizes[1] = Math.ceil(totalSize * percentDone/100);
        sizes[4] = Math.floor(totalSize * (100-percentDone)/100);
    }
},

//>    @method    progressbar.setPercentDone()    ([])
// Sets percentDone to newPercent.
//
//      @visibility external
//        @param    newPercent        (number)    percent to show as done (0-100)
//<
setPercentDone : function (newPercent) {
    if (this.percentDone == newPercent) return;

    newPercent = Math.min(100,(Math.max(0,newPercent)));

    this.percentDone = newPercent;
    if (this.isDrawn()) this.markForRedraw("percentDone updated");
    this.percentChanged();
},

//>    @method    progressbar.percentChanged()    ([A])
// This method is called when the percentDone value changes. Observe this method to be notified upon
// a change to the percentDone value.
//
// @see method:class.observe
// @visibility external
//<
percentChanged : function () { },

//>    @method    progressbar.getLength()    ([])
// Returns the current width of a horizontal progressbar, or height of a vertical progressbar.
//
//      @visibility external
//        @return    (number)    the length of the progressbar
//<
getLength : function () {
    return this.vertical ? this.getHeight() : this.getWidth();
},

//>    @method    progressbar.getBreadth()    ([])
// Returns the current height of a horizontal progressbar, or width of a vertical progressbar.
//
//      @visibility external
//        @return    (number)    the breadth of the progressbar
//<
getBreadth : function () {
    return this.vertical ? this.getWidth() : this.getHeight();
},

//>    @method    progressbar.setLength()
// Sets the length of the progressbar to newLength. This is the width of a horizontal progressbar,
// or the height of a vertical progressbar.
//
// @param newLength (number) the new length of the progressbar
// @visibility external
//<
setLength : function (newLength) {
    this.length = newLength;
    this.vertical ? this.setHeight(newLength) : this.setWidth(newLength);
},

//>    @method    progressbar.setBreadth()
// Sets the breadth of the progressbar to newLength. This is the height of a horizontal progressbar,
// or the width of a vertical progressbar.
//
// @param newBreadth (number) the new breadth of the progressbar
// @visibility external
//<
setBreadth : function (newBreadth) {
    this.breadth = newBreadth;
    this.vertical ? this.setWidth(newBreadth) : this.setHeight(newBreadth);
}

});



//> @class Rangebar
//
//  @treeLocation Client Reference/Control
//<
isc.ClassFactory.defineClass("Rangebar", "Progressbar");

//----------  Define instance properties  ----------\\
isc.Rangebar.addProperties({

    value:0,
    minValue:0,
    maxValue:99,

    title:"",                    // title.............optional display title

    vertical:true,                // vertical.........vertical rangebar if true; horizontal rangebar if false

    showTitle:true,                // showTitle........if true, display the bar's title

    showRange:true,                // showRange........if true, display the min and max values of the bar;

    showValue:true,                // showValue........if true, display the bar's value

    allLabelDefaults : {
        width : 50,
        height : 20,
        spacing : 5          // space between the label and the bar - this is used by Rangebar only
    },

    titleLabelDefaults : {
        width : 100,
        className : "rangebarTitle"
    },

    rangeLabelDefaults : {
        className:"rangebarRange"
    },

    valueLabelDefaults : {
        className:"rangebarValue"
    },

    forceOverrides : {
        _resizeWithMaster: false,
        autoDraw: false
    },

    // text to use for range label instead of minValue
    //minValueLabel:null,

    // text to use for range label instead of maxValue
    //maxValueLabel:null,

    flipValues: false             //XXX NOT TESTED
});

//!>Deferred

//----------  Define instance methods  ----------\\
isc.Rangebar.addMethods({

initWidget : function () {
    this.Super(this._$initWidget);

    this.titleLabelDefaults = isc.addProperties({}, this.allLabelDefaults,
                                                this.titleLabelDefaults);
    this.valueLabelDefaults = isc.addProperties({}, this.allLabelDefaults,
                                                this.valueLabelDefaults);
    this.rangeLabelDefaults = isc.addProperties({}, this.allLabelDefaults,
                                                this.rangeLabelDefaults);
    if (this.showRange) {
        this._minLabel = this.addPeer(this._createRangeLabel("min"));
        this._maxLabel = this.addPeer(this._createRangeLabel("max"));
    }
    if (this.showValue) this._valueLabel = this.addPeer(this._createValueLabel());
    if (this.showTitle) this._titleLabel = this.addPeer(this._createTitleLabel());
    this.setValue(this.value);
},

resized : function(deltaX, deltaY) {
    this._adjustPeerPositions();
},

_adjustPeerPositions : function() {
    if(this.showRange && this._minLabel && this._maxLabel) {
        var minProps = this._computeRangeLabelProperties("min");
        var maxProps = this._computeRangeLabelProperties("max");
        this._minLabel.moveTo(minProps.left, minProps.top);
        this._maxLabel.moveTo(maxProps.left, maxProps.top);
    }

    if(this.showValue && this._valueLabel) {
        var props = this._computeValueLabelProperties();
        this._valueLabel.moveTo(props.left, props.top);
    }

    if(this.showTitle && this._titleLabel) {
        var props = this._computeTitleLabelProperties();
        this._titleLabel.moveTo(props.left, props.top);
    }
},

//------  _createRangeLabel(minOrMax)
// Creates, initializes, and returns a new Label widget to be the rangebar's mix or max value
// label. minOrMax must be the string "min" or "max".
_createRangeLabel : function (minOrMax) {
    var props = this._computeRangeLabelProperties(minOrMax);

    return isc.Label.newInstance({
        ID:this.getID()+"_"+minOrMax+"Label",
        contents:(minOrMax == "min" ?
            (this.minValueLabel ? this.minValueLabel : this.minValue) :
            (this.maxValueLabel ? this.maxValueLabel : this.maxValue) )
    }, this.rangeLabelDefaults, props, this.forceOverrides);
},

_computeRangeLabelProperties : function (minOrMax) {
    var props = {},
        defs = this.rangeLabelDefaults,
        shouldFlip = ((minOrMax == "min" && !this.flipValues) ||
                      (minOrMax = "max" && this.flipValues));

    if (this.vertical) {
        props.left = this.left + this.width + defs.spacing,
        props.align = isc.Canvas.LEFT;
        if (shouldFlip) {
            props.top = this.getTop() + this.getHeight() - defs.height;
            props.valign = isc.Canvas.BOTTOM;
        } else {
            props.top = this.getTop();
            props.valign = isc.Canvas.TOP;
        }
    } else { // this.horizontal
        props.top = this.getTop() + this.getHeight() + defs.spacing,
        props.valign = isc.Canvas.TOP;
        if (shouldFlip) {
            props.left = this.getLeft();
            props.align = isc.Canvas.LEFT;
        } else {
            props.left = this.getLeft() + this.getWidth() - defs.width;
            props.align = isc.Canvas.RIGHT;
        }
    }
    return props;
},


//------  _createTitleLabel()
// Creates, initializes, and returns a new Label widget to be the reangebar's title label.
_createTitleLabel : function () {
    var props = this._computeTitleLabelProperties();

    return isc.Label.newInstance({
        ID:this.getID()+"_titleLabel",
        contents:this.title
    }, this.titleLabelDefaults, props, this.forceOverrides);
},

_computeTitleLabelProperties : function () {
    var props = {};
    var defs = this.titleLabelDefaults;

    if (this.vertical) {
        props.left = this.left + this.width/2 - defs.width/2;
        props.top = this.top - defs.height - defs.spacing;
        props.align = isc.Canvas.CENTER;
    } else {
        props.left = this.left - defs.width - defs.spacing;
        props.top = this.top + this.getHeight()/2 - defs.height/2;
        props.align = isc.Canvas.RIGHT;
    }

    return props;
},


//------  _createValueLabel()
// Creates, initializes, and returns a new Label widget to be the rangebar's dynamic value
// label.
_createValueLabel : function () {
    var props = this._computeValueLabelProperties();

    return isc.Label.newInstance({
        ID:this.getID()+"_valueLabel",
        contents:this.value,
        mouseUp:"return false;",
        observes:[{source:this, message:"valueChanged", action:"observer.setContents(this.getValue())"}]
    }, this.valueLabelDefaults, props, this.forceOverrides);
},

_computeValueLabelProperties : function () {
    var props = {};
    var defs = this.valueLabelDefaults;

    if (this.vertical) {
        props.left = this.left - defs.width - defs.spacing;
        props.top = this.top + this.getHeight()/2 - defs.height/2;
        props.align = isc.Canvas.RIGHT;
        props.valign = isc.Canvas.CENTER;
    } else {
        props.left = this.left + this.width/2 - defs.width/2;
        props.top = this.top - defs.height - defs.spacing;
        props.align = isc.Canvas.CENTER;
        props.valign = isc.Canvas.BOTTOM;
    }
    return props;
},

getValue : function () {
    return this.value;
},

// Sets this.value to the new value, moves the rangebar to the appropriate position
// for this value, and calls valueChanged() which you can observe
setValue : function (newValue) {
    // do nothing if the value hasn't actually changed
    if (this.value == newValue) return;

    // make sure the new value falls in the range allowed by this instance.
    // If the value provided is outside the range, it clamps to the appropriate
    // boundary (min/max)
    if (newValue > this.maxValue) newValue = this.maxValue;
    else if (newValue < this.minValue) newValue = this.minValue;
    this.value = newValue;
    this.percentDone = 100 * (this.value - this.minValue) / (this.maxValue - this.minValue);
    this.markForRedraw();
    this.valueChanged();    // observable method
},

valueChanged : function () {

}

});
//!<Deferred







//>    @class    Toolbar
//
// A Toolbar creates a vertical or horizontal strip of similar components (typically Buttons)
// and provides managed resizing and reordering behavior over those components.
// <p>
// If you are creating a bar with a mixture of different elements (eg some MenuButtons, some
// Labels, some Buttons, some custom components), you want to use a +link{ToolStrip}.  A
// Toolbar is better suited for managing a set of highly similar, interchangeable components,
// such as ListGrid headers.
//
// @treeLocation Client Reference/Layout
// @visibility external
//<

// declare the class itself
isc.ClassFactory.defineClass("Toolbar", "Layout");

// add default properties to the class
isc.Toolbar.addProperties( {
    //>    @attr    toolbar.buttons        (array : null : [IRW])
    // An array of button object initializers. See the Button Widget Class for standard
    // button properties. The following additional properties can also be specified for
    // button sizing and positioning on the toolbar itself:<br><br>
    // <ul><li>width--Specifies the width of this button as an absolute number of pixels, a
    // named property of the toolbar that specifies an absolute number of pixels, a
    // percentage of the remaining space (e.g. '60%'), or "*" (default) to allocate an
    // equal portion of the remaining space.
    // <li>height--Specifies the height of this button.
    // <li>extraSpace--Specifies an optional amount of extra space, in pixels, to separate
    // this button from the next button in the toolbar.</ul>
    //
    // @setter toolbar.setButtons()
    // @see toolbar.addButtons()
    // @see toolbar.removeButtons()
    // @see class:Button
    // @visibility external
    //<

    //>    @attr    toolbar.vertical        (Boolean : false : [IRW])
    // Indicates whether the buttons are drawn horizontally from left to right (false), or
    // vertically from top to bottom (true).
    //        @group    appearance
    //      @visibility external
    //<
    vertical:false,

    //>    @attr    toolbar.overflow        (Overflow : Canvas.HIDDEN : IRWA)
    // Clip stuff that doesn't fit
    //        @group    clipping
    //<
    overflow:isc.Canvas.HIDDEN,

    //>    @attr    toolbar.height        (number : 20 : IRW)
    // Default to a reasonable height
    //        @group    sizing
    //<
    height:20,

    //>    @attr    toolbar.buttonConstructor        (Class : Button : IRWA)
    // Default constructor for toolbar items.
    //        @group    appearance
    //    @visibility external
    //<
    buttonConstructor:"Button",

    //>    @attr    toolbar.canReorderItems        (Boolean : false : IRWA)
    //        If true, items can be reordered by dragging on them.
    //        @group    dragndrop
    //    @visibility external
    //<
    canReorderItems:false,

    //>    @attr    toolbar.canResizeItems        (Boolean : false : IRWA)
    //        If true, items (buttons) can be resized by dragging on them.
    //        @group    dragndrop
    //    @visibility external
    //<
    canResizeItems:false,

    //>    @attr    toolbar.canRemoveItems      (boolean : false : IRWA)
    // If true, items (buttons) can be dragged out of this toolbar to be dropped somewhere else
    //        @group    dragndrop
    //<
    canRemoveItems:false,

    //>    @attr    toolbar.canAcceptDrop (Boolean : false : IRWA)
    // If true, items (buttons) can be dropped into this toolbar, and the toolbar will
    // show a drop line at the drop location.  Override drop() to decide what happens when the
    // item is dropped.
    //
    //        @group    dragndrop
    //    @visibility external
    //<



    //>    @attr    toolbar.reorderOnDrop       (boolean : true : IRWA)
    //     On drop, should the Toolbar rearrange the buttons array?  Set to false by advanced
    //     classes that want to manage reordering themselves.
    //        @group    dragndrop
    //<
    reorderOnDrop:true,

    //>    @attr    toolbar.tabWithinToolbar   (boolean : true : IRWA)
    //      Should each button in the toolbar be included in the tab-order for the page, or
    //      should only one button in the toolbar show up in the tab-order, and arrow-keys be
    //      used to switch focus within the toolbar?
    //<
    tabWithinToolbar:true,




    //> @attr toolbar.allowButtonReselect (boolean : false : IRWA)
    // When a button is clicked but is already selected, should an additional
    // +link{buttonSelected} event be fired?
    //<
    allowButtonReselect:false,

    //>    @attr    toolbar.buttonDefaults        (object : varies : [IRWA])
    // Settings to apply to all buttons of a toolbar. Properties that can be applied to
    // button objects can be applied to all buttons of a toolbar by specifying them in
    // buttonDefaults using the following syntax:<br>
    // <code>buttonDefaults:{property1:value1, property2:value2, ...}</code><br>
    // See the Button Widget Class for standard button properties.
    //        @group    appearance
    //      @see class:Button
    //      @visibility external
    //<
    //    The following are defaults for all toolbar buttons.
    //    To add properties to all buttons of ALL toolbars, change the below.
    //    To add properties to all buttons of a particular toolbar you're creating,
    //        add a "button" property to the toolbar constructor with the defaults
    //        you want applied to the buttons.  This will automatically be added to each button.
    buttonDefaults: {
        click : function() {
            this.Super("click", arguments);
            this.parentElement.itemClick(this, this.parentElement.getButtonNumber(this))
        },
        doubleClick : function () {
            this.Super("doubleClick", arguments);
            this.parentElement.itemDoubleClick(this, this.parentElement.getButtonNumber(this))
        },
        setSelected : function() {
            var oldState = this.isSelected();
            this.Super("setSelected", arguments);
            if (this.parentElement &&
                (this.parentElement.allowButtonReselect || oldState != this.isSelected()))
            {
                if (this.isSelected()) this.parentElement.buttonSelected(this);
                else this.parentElement.buttonDeselected(this);
            }
        },
        dragAppearance:isc.EventHandler.NONE,

        // Toolbars typically manipulate the tabIndex of their buttons.
        // If the user specifies a tabIndex on a toolbar button directly, assume they are
        // managing the tabIndex for the button - clear the flag that marks the button as having
        // it's tabIndex managed by the toolbar
        setTabIndex : function (index) {
            this.Super("setTabIndex", arguments);
            this._toolbarManagedTabIndex = null;
        },

        // Override setAccessKey to take a second parameter, indicating that the accessKey is
        // being set by the toolbar
        // If this parameter is not passed in, assume the user / developer is setting the
        // accessKey and clear the flag that marks the button's accessKey as being managed by
        // the toolbar
        setAccessKey : function (accessKey, managedByToolbar) {
            if (!managedByToolbar) this._toolbarManagedAccessKey = null;
            this.Super("setAccessKey", [accessKey]);
        },

        // When focus goes to a button, set the tabIndex of the button to the toolbars tabIndex.
        // This means when tabbing out of the button, the focus will go to the appropriate next
        // element - use the _updateFocusButton() method on the toolbar to achieve this.
        focusChanged : function (hasFocus) {
            if (this.hasFocus && this.parentElement._updateFocusButton) {
                this.parentElement._updateFocusButton(this)
            }
        },

        _focusInNextTabElement : function (forward, mask) {
            if (this.parentElement._focusInNextTabElement) {
                this.parentElement._focusInNextTabElement(forward, mask, this);
            }
        }
    }
});


isc.Toolbar.addMethods({

//>    @method    toolbar.draw()    (A)
//    Override the draw method to set up the buttons first
//        @group    drawing
//<
draw : function (a,b,c,d) {
    if (isc._traceMarkers) arguments.__this = this;

    if (!this.readyToDraw()) return this;

    // If we've never init'd our buttons, do so now by calling setButtons with no parameters
    if (!this._buttonsInitialized) this.setButtons();

    this.invokeSuper(isc.Toolbar, "draw", a,b,c,d);
},


//>    @method    toolbar.keyPress()
// Override keypress to allow navigation between the buttons on the toolbar
//        @group    events
//<
// Note - this is typically going to be bubbled up from the menu bar buttons
keyPress : function () {
    var keyName = this.ns.EH.lastEvent.keyName;
    // note - if we're allowing the user to tab between the buttons on the toolbar, we don't need
    // to give them the navigation via arrow keys.
    if (!this.tabWithinToolbar) {
        if ((this.vertical && keyName == "Arrow_Up") ||
            (!this.vertical && keyName == "Arrow_Left")) {

            this._focusInNextButton(false);
            return false;

        } else if ((this.vertical && keyName == "Arrow_Down") ||
                   (!this.vertical && keyName == "Arrow_Right")){
            this._focusInNextButton();
            return false;
        }
    }

    return this.Super("keyPress", arguments);
},

_focusInNextButton : function (forward, startingIndex) {

    // Note - this.buttons is the list of button init objects.  The live widgets are available
    // via this.getMembers()
    forward = (forward != false);
    var focusIndex = (startingIndex != null ? startingIndex : this.getFocusButtonIndex());
    if (focusIndex == null) focusIndex = (forward ?  -1 : this.buttons.length);

    // find the next focusable member in this direction, if any
    focusIndex += forward ? 1 : -1;
    while (focusIndex >=0 && focusIndex < this.buttons.length) {
        var button = this.getMembers()[focusIndex];
        if (button._canFocus()) {
            button.focus();
            // Returning true will indicate successful shift of focus
            return true;
        }
        focusIndex += forward ? 1 : -1;
    }
    return false;
},

//> @method toolbar.getFocusButtonIndex()  (A)
//  @return (number)    Index of whichever button currently has focus for keyboard input
//                      [On a mouse click, this will typically match the value returned by
//                      toolbar.getMouseOverButtonIndex(), but is likely to differ if the button
//                      was activated by keyboard interaction]
//<
getFocusButtonIndex : function () {

    var buttons = this.getButtons(),
        focusItemNum;
    for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].hasFocus) {
            focusItemNum = i;
            break;
        }
    }
    return focusItemNum;
},

// _focusInNextTabElement() - used when we're managing synthetic focus due to showing a
// clickMask.
// Since we do custom management of our buttons' tabIndices, we need to also explicitly
// manage synthetic tabbing to them

_focusInNextTabElement : function (forward, mask, button) {
    if (!isc.EH.targetIsMasked(this, mask)) {
        var focusButton = button ? this.members.indexOf(button) : null;

        if (!this.tabWithinToolbar) {
            if (forward && focusButton == null) {
                var fb = this._currentFocusButton;
                if (fb != null) return this.fb.focus();
            }

        } else if (this._focusInNextButton(forward, focusButton)) return;
    }
    return this.Super("_focusInNextTabElement", arguments);
},

// Widget level _canFocus
// Override this to return true. This will ensure that if a hard mask is showing, and we're
// doing synthetic tab index management, the toolbar doesn't get skipped.
_canFocus : function (a,b,c,d) {
    var members = this.members;
    if (members && members.length > 0) {
        for (var i = 0; i < members.length; i++) {
            if (members[i]._canFocus()) return true;
        }
    }
    return this.invokeSuper(isc.Toolbar, "_canFocus", a,b ,c,d);
},

// Override focus() to put focus into the button(s) in the toolbar

// Override 'setFocus()' to update button focus only.

setFocus : function (hasFocus) {
    if (!this._readyToSetFocus()) return;
    var buttonIndex = this.getFocusButtonIndex();
    if (!hasFocus) {
        if (buttonIndex != null && this.members) this.members[buttonIndex].setFocus(false);
    } else {
        // If one of our buttons already has focus, just no op.
        if (buttonIndex != null) return;

        if (this._currentFocusButton) this._currentFocusButton.setFocus(true);
        else this._focusInNextButton();
    }
},

// Override focusAtEnd() so we can put focus into the first / last button if appropriate
focusAtEnd : function (start) {
    if (!this.tabWithinToolbar) {
        return this.Super("focusAtEnd", arguments);
    }

    // typecast start to a boolean before passing it to 'focusInNextButton' as the 'forward'
    // param.
    start = !!start;
    var focusIndex = (start ?  -1 : this.buttons.length);
    this._focusInNextButton(start, focusIndex);
},

// An internal method to set the tab index of a button, and flag the button as having it's tab index
// managed by the toolbar.
_setButtonTabIndex : function (button, newTabIndex) {


    if (!button._toolbarManagedTabIndex &&
        (button._getNextTabWidget() != null || button._getPreviousTabWidget() != null))
    {
         button._removeFromAutoTabOrder();
    }

    // Note that the toolbar is managing the tab index of the button
    button._toolbarManagedTabIndex = true;

    // update the tab index of the button.

    if (button.tabIndex != newTabIndex) button._setTabIndex(newTabIndex, false);
},

// Override updateMemberTabIndex (inherited from Layout)
// to be a No-Op, since we manage our members' (buttons') tabindices

updateMemberTabIndex : function () {
},


_slotChildrenIntoTabOrder : function () {
},

// _setButtonAccessKey()
// Internal method to set the accessKey for a button within this toolbar.
// Also sets the flag '_toolbarManagedAccessKey' on the button
_setButtonAccessKey : function (button, key) {
    button._toolbarManagedAccessKey = true;
    // see comment in the override for setAccessKey for why we're passing in this 2nd parameter
    button.setAccessKey(key, true);
},



// setupButtonFocusProperties()
// An internal method to set the tab indexes of any buttons in the toolbar without existing
// user-specified tab indexes
setupButtonFocusProperties : function () {
    // first update the 'currentFocusButton' if its out of date.
    // This will set the tabIndex and accessKey for the button (unless that would override an
    // explicitly specified property for the button).

    // Note - this.buttons is the list of button init objects.
    // The actual button objects are available via this.getButtons()

    var focusButton = this._currentFocusButton;

    if ( (!focusButton || !isc.isA.Canvas(focusButton) ||
          focusButton.visibility == isc.Canvas.HIDDEN ) && this.buttons.length > 0)
    {
        var newFocusButton;
        for (var i = 0; i < this.members.length; i++) {

            if (isc.isA.Canvas(this.members[i]) &&
                this.members[i].visibility != isc.Canvas.HIDDEN)
            {
                newFocusButton = this.members[i];
                break;
            }
        }
        this._updateFocusButton(newFocusButton)
        focusButton = this._currentFocusButton;
    }


    var defaultTabIndex;
    if (this.tabWithinToolbar) {
        defaultTabIndex = this.getTabIndex();
    } else {
        defaultTabIndex = -1;
    }

    // update the tabIndex of any buttons who have no user-specified tab index, and
    // for which we haven't yet managed the tabIndex
    var buttons = this.getButtons();
    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        if (button != focusButton &&
            (button.tabIndex == null || button._autoTabIndex))
        {

            //this.logWarn("updating tab index of: " + button + " to " + defaultTabIndex);
            this._setButtonTabIndex(button, defaultTabIndex)
        }
    }
},


_updateFocusButton : function (newFocusButton) {
    // Bail if the current focus button was passed in
    if (this._currentFocusButton == newFocusButton) {
        return;
    }

    // Update the accessKey for the current focus button unless it has / had an explicitly
    // specified accessKey
    if (newFocusButton.accessKey != this.accessKey &&
        (newFocusButton.accessKey == null || newFocusButton._toolbarManagedAccessKey))
    {
        this._setButtonAccessKey(newFocusButton, this.accessKey)
    }

    // Update focus button tab index (if allocated by us)
    if (newFocusButton.tabIndex == null || newFocusButton._autoTabIndex ||
        newFocusButton._toolbarManagedTabIndex)
    {

        // set the newly focused button to the tabIndex of the Toolbar
        this._setButtonTabIndex(newFocusButton, this.getTabIndex());
    }

    var oldFocusButton = this._currentFocusButton;
    // If appropriate, remove the previous focus button from the tab order
    if (oldFocusButton != null &&
        (oldFocusButton.tabIndex == null || oldFocusButton._autoTabIndex ||
         oldFocusButton._toolbarManagedTabIndex))
    {
        // Remove from tab order if we are not tabbing between buttons
        if (!this.tabWithinToolbar) this._setButtonTabIndex(oldFocusButton, -1);

        // Clear the accessKey property if it was added by the toolbar
        if (oldFocusButton.accessKey != null &&
            oldFocusButton._toolbarManagedAccessKey)
        {
            this._setButtonAccessKey(oldFocusButton, null)
        }
    }
    this._currentFocusButton = newFocusButton;
},

// Override _setTabIndex() to set also update the tab index of the buttons
_setTabIndex : function (a,b,c,d) {
    this.invokeSuper(isc.Toolbar, "_setTabIndex", a,b,c,d);

    // if this.tabWithinToolbar is true, update each of the buttons' tab index to match the
    // toolbars new tab index
    if (this.tabWithinToolbar) {
        var buttons = this.getButtons();
        for (var i = 0; i < buttons.length; i++) {
            if (buttons[i].tabIndex == null || buttons[i]._autoTabIndex ||
                buttons[i]._toolbarManagedTabIndex)
                this._setButtonTabIndex(buttons[i], this.getTabIndex())
        }
    // otherwise use _updateFocusButton to update the tab index of the focus button only (other
    // buttons' tab index will already be -1 -- no need to change)
    } else {
        var button = this._currentFocusButton;
        if (button != null) {
            this._currentFocusButton = null;
            this._updateFocusButton(button);
        }
    }
},

// Override setAccessKey() to alo set the accessKey for the toolbar
setAccessKey : function (accessKey) {
    this.Super("setAccessKey", arguments);

    // use updateFocusButton to update the accessKey for the focus button
    var button = this._currentFocusButton;
    if (button != null) {
        this._currentFocusButton = null;
        this._updateFocusButton(button);
    }

},

getLength : function (a,b,c,d) {
    // the Toolbar allows overriding the area allocated to layout members, so that it may be
    // larger or smaller than the Layout's area.
    if (this.innerWidth != null) return this.innerWidth;
    return this.invokeSuper(isc.Toolbar, "getLength", a,b,c,d);
},

//>    @method    toolbar.setButtons()
// Apply a new set of buttons to render in this toolbar as +link{toolbar.buttons}.
//
// @param [newButtons] (Array of Button Properties) properties to create each button from
// @visibility external
//<
setButtons : function (newButtons) {

    // one time flag - allows us to set up our buttons on initial draw only.
    // If 'setButtons' is called before draw we won't unnecessarily remove and re-add them all.
    this._buttonsInitialized = true;

    //this.logWarn("setButtons at\n" + this.getStackTrace());

    // if buttons are passed in, use those
    // Otherwise we'll just make actual button instances from the current items in this.buttons
    if (newButtons) this.buttons = newButtons;

    if (this.members == null) this.members = [];

    // destroy any existing members, and create new buttons from scratch
    var _buttons = this.members.duplicate();
    for (var i = 0; i < _buttons.length ; i++) {
        var oldButton = _buttons[i];
        // destroy any members we automatically created from the buttons array
        if (!this.buttons.contains(oldButton)) {
            //this.logWarn("destroying old button " + i);
            // destroying it will automagically remove it from this as a member, so no
            // need to call this.removeMembers()
            _buttons[i].destroy();
        }
    }

    // now create actual button widgets
    if (this.buttons == null) this.buttons = [];

    var newMembers = [];
    for (var i = 0; i < this.buttons.length; i++) {
        var button = this.buttons[i];

        // allow widgets to be placed directly in the buttons array, which we simply add as
        // members and ignore.  These members will not have pick up buttonDefaults, hence won't
        // fire itemClick, have associated panes, allow managed resize, etc.
        if (!isc.isA.Canvas(button)) button = this.makeButton(button);

        newMembers[newMembers.length] = button;

        if (isc.isA.StatefulCanvas(button)) {
            var actionType = button.getActionType();

            if (actionType == isc.StatefulCanvas.RADIO) {

                // For actionType:radio buttons, remember initial selected button.
                // We update this on selection change.
                // This property will be returned on 'Toolbar.getSelectedButton()'
                // Note - no error checking for multiple selection within a toolbar
                // If each 'actionType' RADIO button has no specified radiogroup, the default
                // toolbar behavior is to put them into the same radioGroup. In this case default
                // radiogroup selection behavior inherited from StatefulCanvas will prevent
                // multiple selection within a toolbar.
                // If the user has specified a radiogroup for any actionType:RADIO buttons, we
                // can't guarantee there won't be multiple selection within a toolbar.
                // In this case 'getSelectedButton()' will return the most recently selected RADIO
                // button within this toolbar, rather than the only selected radio button.
                if (button.selected) this.lastSelectedButton = button;
            }
        }
    }
    this.addMembers(newMembers, 0);

    if (this.canResizeItems) this.setResizeRules();
    // Set up the tab indexes for the buttons, and the accessKey for the focus button
    this.setupButtonFocusProperties();

},

// shouldHiliteAccessKey implementation for buttons in this toolbar
buttonShouldHiliteAccessKey : function () {
    // If the accessKey comes from the toolbar itself, don't hilite
    // otherwise we will end up with underlining of the title on multiple buttons which
    // is likely to look odd.
    if (this._toolbarManagedAccessKey) return false;
    return this.hiliteAccessKey;
},

makeButton : function (button) {
    // the default sizing behavior we want:
    // - horizontal toolbars autoSize button heights to the Toolbar's height and autoSize
    //   button widths to the button text.
    // - vertical toolbars autoSize button width to the Toolbar's width and autoSize button
    //   heights to the (wrapped) button text.


    button.width = button.width || null;
    button.height = button.height || null;

    // set button properties to enable/disable dragging and dropping, so that dragging will
    // be allowed on members and will bubble to the Toolbar

    button.canDrag = this.canReorderItems || this.canDragSelectItems || this.canRemoveItems;

    // don't override canDragResize to true on the button if it's been explicitly turned off
    button.canDragResize = (button.canDragResize != null ?
        button.canDragResize && this.canResizeItems : this.canResizeItems);

    // toolbar allows things to be dropped on it (currently no default behavior for what happens
    // on drop)
    button.canAcceptDrop = this.canAcceptDrop;
    // if you can drag items out of the toolbar, make the buttons droppable
    button.canDrop = this.canRemoveItems;

    button.shouldHiliteAccessKey = this.buttonShouldHiliteAccessKey;

    // create a new button widget
    //this.logWarn("creating new button " + i);
    return this._makeItem(button, null);
},

//>    @method    toolbar._makeItem()
// Creates and returns a widget for the toolbar
//        @group    drawing
//
//        @param    [buttonProperties]    (object)    the button properties
//        @param    [rect]        (object)    the rectangle for this widget, e.g. {top:50, left:100, ...}
//
//        @return    (object)    the created widget
//<
_makeItem : function (buttonProperties, rect) {
    var cons = (buttonProperties.buttonConstructor
                        ? buttonProperties.buttonConstructor
                        : this.buttonConstructor
                      )
    ;
    cons = this.ns.ClassFactory.getClass(cons);

    var item = cons.newInstance(
                {autoDraw:false},
                this.buttonDefaults,    // isc.Toolbar class defaults
                this.buttonProperties,    // isc.Toolbar instance defaults
                buttonProperties,       // properties for this button
                rect                    // rectangle for the button
            );

    if (!isc.isA.StatefulCanvas(item)) return item;

    // if the button is of actionType 'radio' and the developer has not specified a
    // radioGroup, set radioGroup to the ID of this toolbar
    // Developer can override by setting 'radioGroup' property explicitly on the
    // item's properties.
    var unset;
    if ((item.getActionType() == isc.StatefulCanvas.RADIO && item.radioGroup === unset)
        || item.defaultRadioGroup != null) {
        var rg = item.defaultRadioGroup != null ? item.defaultRadioGroup : this.getID();
        item.addToRadioGroup(rg);
    }

    return item;
},

//>    @method    toolbar.addButtons()
// Add a list of buttons to the toolbar
// @param [buttons]    (Array of objects) list of button object initializers.
// @param [position] (number) position to add the new buttons at
// @visibility external
//<
addButtons : function (buttons, position) {

    if (buttons == null) return;
    if (!isc.isAn.Array(buttons)) buttons = [buttons];

    if (!this._buttonsInitialized) this.setButtons();
    buttons.removeEvery(null);

    // (currently undocumented) feature - support passing in position for each
    // button being added - in this case the 2nd argument will be an array of the
    // same length as the buttons array.
    // Break into discrete blocks of adjacent buttons so we can use standard list manipulation
    // APIs rather than having to iterate through every button and add as a member individually,
    // rerunning layout.
    var discreteBlocks;
    if (isc.isAn.Array(position)) {
        if (position.length != buttons.length) {
            this.logWarn("addButtons passed " + buttons.length + " buttons with " + position.length
                + " discrete positions specified. Ignoring.");
            return;
        }
        var mapping = {};
        for (var i = 0; i < position.length; i++) {
            mapping[position[i]] = buttons[i];
        }

        // sort the positions - we'll need to add buttons starting with the
        // leftmost position (Otherwise adding an item, then a second item to the left of
        // it would shift the first item a slot to the right from the desired position).
        position.sort();

        discreteBlocks = [];
        var currentBlock = {buttons:[], position:position[0]},
            currentIndex = 0;
        for (var i = 0; i < position.length; i++) {
            var pos = position[i],
                button = mapping[pos];

            currentBlock.buttons.add(button);

            var nextPos = position[i+1]
            if (nextPos == null || nextPos != pos+1) {

                discreteBlocks[currentIndex] = currentBlock;
                currentIndex++

                // New discrete block for the next time through this loop
                if (nextPos != null) currentBlock = {buttons:[], position:nextPos};
            }
        }
        for (var i = 0; i < discreteBlocks.length; i++) {
            this.buttons.addListAt(discreteBlocks[i].buttons, discreteBlocks[i].position);
        }
    } else {
        // Update this.buttons to include the new buttons:
        this.buttons.addListAt(buttons, position);
    }

    // if instantRelayout is true, delay the relayout until we've added the full
    // set of members
    var forceReflow = this.instantRelayout;
    this.instantRelayout = false;

    // Add as members to the right position, and let layout handle spacing and stuff
    var buttonWidgets;
    if (discreteBlocks == null) {
        buttonWidgets = this._createButtonInstances(buttons);
        this.addMembers(buttonWidgets, position)
    } else {
        for (var i = 0; i < discreteBlocks.length; i++) {
            var currentButtons = this._createButtonInstances(discreteBlocks[i].buttons);
            this.addMembers(currentButtons, discreteBlocks[i].position);

            if (buttonWidgets == null) buttonWidgets = currentButtons;
            else buttonWidgets.addList(currentButtons);
        }
    }
    if (forceReflow) {
        this.instantRelayout = true;
        if (this._layoutIsDirty) this._layoutIsDirty = false;
        this.reflow("addButtons");
    }

    // setResizeRules to update dragResizing, etc.
    if (this.canResizeItems) this.setResizeRules();

    buttonWidgets.map("show");  // auto-show the new members
},

_createButtonInstances : function (buttons) {
    var buttonWidgets = [];
    for (var i = 0; i < buttons.length; i++) {
           var button = buttons[i],
        // call makeButton() to convert the init block to a widget with the appropriate
        // propoerties (canDrag, buttonDefaults, etc)
        // Note that canvases are just integrated into the buttons block without
        // attempting to modify properties, as with setButtons()
        buttonWidget = isc.isA.Canvas(button) ? button : this.makeButton(button);
        buttonWidgets[i] = buttonWidget;
    }
    return buttonWidgets;
},


//>    @method    toolbar.removeButtons()
//    Remove a list of buttons from the toolbar
//
// @param [buttons]    (Array) Array of buttons to remove. Buttons may be specified as pointers to
// the button instances contained in this toolbar, or numbers indicating the index of the buttons
// in <code>this.buttons</code>.
// @visibility external
//<
removeButtons : function (buttons) {
    if (buttons == null) return;
    if (!isc.isAn.Array(buttons)) buttons = [buttons];

    // We're going to manipulate the this.buttons array (button description objects), and
    // the actual buttons in this.members - so will need pointers to both the
    // button descriptor objects and the button instances.
    var buttonWidgets = [];

    // The buttons to remove can be specified as:
    // a) Index in this.buttons
    // b) Button widget
    // c) Button instantiation block
    // d) ID of button
    for (var i =0; i < buttons.length; i ++) {

        // resolve whatever object was passed in to a button instantiation block
        buttons[i] = this.buttons[this.getButtonNumber(buttons[i])];

        if (buttons[i] == null)  {
            this.logWarn("removeButtons(): unable to find button for item number " + i +
                        " in the array passed in.  Skipping this item.");
            buttons.removeItem(i);
            i -= 1;
            continue;
        }
        // get a pointer to the Canvas as well
        buttonWidgets[i] = this.getButton(this.buttons.indexOf(buttons[i]))
    }

    var completeButtons = this.buttons;
    // if (any of) the buttons aren't in this.buttons, this has no effect
    completeButtons.removeList(buttons);

    this.removeMembers(buttonWidgets);
// should we destroy them?

},

//>    @method    toolbar.getButton() ([])
//          Retrieves a button widget instance (within this toolbar) from the name / ID / index /
//          descriptor object for the button (as with the getButtonNumber() method)
//          This provides a way to access a toolbar button's properties and methods directly.
//      @see    getButtonNumber()
//      @visibility external
//        @group    buttons
//        @param    index        (number | string | object)    identifier for the button to retrieve
//
//      @return (Button)    the button, or null if the button wasn't found
//<
getButton : function (index) {
    index = this.getButtonNumber(index);
    return this.getMember(index);
},

//>    @method    toolbar.getButtonNumber()    (A)
//            get the index of a button in the buttons array<p>
//          The button can be specified as -
//          <ul>
//          <li>an index within this.buttons (just returned)
//          <li>the ID property of a button
//          <li>a pointer to the button descriptor object in this.buttons
//          <li>the actual button widget in this.members
//          </ul><p>
//            returns -1 if not found
//
//        @param    button        (number | string  | button object | button widget)
//
//        @return    (number)    index of the button in question
// @visibility external
//<
getButtonNumber : function (button) {
    // if we're passed an Object that isn't a Canvas, it might be a button configuration object
    if (isc.isAn.Object(button) && !isc.isA.Canvas(button)) return this.buttons.indexOf(button);
    // otherwise use normal member lookup
    return this.getMemberNumber(button);
},

//>    @method    toolbar.getButtons()
//        @group    buttons
//        @return (array) array of all buttons in the Toolbar
//<
getButtons : function () {
    return this.members;
},

//> @method toolbar.setCanResizeItems()
// Setter for updating +link{toolbar.canResizeItems} at runtime.
// @param canResizeItems (boolean) New value for this.canResizeItems
// @visibility external
//<
setCanResizeItems : function (canResizeItems) {
    if (this.canResizeItems == canResizeItems) return;
    this.canResizeItems = canResizeItems;
    var buttons = this.getButtons();
    if (!buttons) return;
    for (var i = 0; i < buttons.length; i++) {
        var item = buttons[i];
        item.canDragResize = (item.canDragResize != null ?
            item.canDragResize && canResizeItems : canResizeItems);
    }
    this.setResizeRules();
},

// update which edges a button can be resized from.
//
// When you dragResize buttons, it always effects the button on the left (or top), regardless
// of which side of the boundary between the buttons you click on (this is pulled off by
// switching the dragTarget on the fly).  This means the sides that each button can be resized
// from is affected by whether the adjacent buttons can be resized.  setResizeRules updates
// this; it needs to be called on any reorder, addition or removal of buttons.
setResizeRules : function () {
    if (!this.members) return;

    var rtl = this.isRTL();

    // buttons can resize along the long axis of the toolbar.
    var edgeCursorMap, resizeFrom, resizeFromOneSide;
    if (this.vertical) {
        edgeCursorMap = {"T":isc.Canvas.ROW_RESIZE, "B":isc.Canvas.ROW_RESIZE };
        resizeFrom = ["T","B"];
        resizeFromOneSide = ["B"];
    } else {
        edgeCursorMap = {"L":isc.Canvas.COL_RESIZE, "R":isc.Canvas.COL_RESIZE };
        resizeFrom = ["L","R"];
        if (!rtl) {
            resizeFromOneSide = ["R"];
        } else {
            resizeFromOneSide = ["L"];
        }
    }

    var previousCantResize = false;
    for (var i = 0; i < this.members.length; i++) {
        var button = this.members[i];
        if (!button.canDragResize) {
            button.resizeFrom = button.edgeCursorMap = null;
            previousCantResize = true;
        } else {
            if (previousCantResize || i == 0)
            {
                // the first button, or any button next to a button that can't resize, is not
                // allowed to resize from it's left/top.
                button.resizeFrom = resizeFromOneSide;
            } else {
                button.resizeFrom = resizeFrom;
            }
            button.edgeCursorMap = edgeCursorMap;
            previousCantResize = false;
        }
    }
},

//>    @method    toolbar.getSelectedButton()    (A)
// Get the button currently selected.
//        @return (object) button
//<
getSelectedButton : function () {
    return this.lastSelectedButton;
},

//>    @method    toolbar.selectButton()  ([])
// Given an identifier for a button, select it.
// The button identifier can be a number (index), string (id), or object (widget or init block),
// as with the getButtonNumber() method.
//
//      @see    getButtonNumber()
//        @group    selection
//        @param    buttonID        (number | string | object | canvas)    Button / Button identifier
//      @visibility external
//<
selectButton : function (buttonID) {

    if (!this.members) return;
    var btn = this.getButton(buttonID);
    if (btn && isc.isA.StatefulCanvas(btn)) btn.select();
},


//>    @method    toolbar.deselectButton()    ([])
//    Deselects the specified button from the toolbar, where buttonID is the index of
//  the button's object initializer. The button will be redrawn if necessary.
//  The button identifier can be a number (index), string (id), or object (widget or init block),
// as with the getButtonNumber() method.
//      @see    getButtonNumber()
//      @visibility external
//        @group    selection
//        @param    buttonID        (number | string | object | canvas)    Button / Button identifier
//<
deselectButton : function (buttonID) {
    var btn = this.getButton(buttonID);
    if (btn) btn.deselect();
},


//>    @method    toolbar.buttonSelected()    (A)
// One of the toolbar button was just selected -- update other buttons as necessary
//        @group    selection
//
//        @param    button        (button object)        a member of this.buttons
//<
buttonSelected : function (button) {
    if (button.getActionType() == isc.Button.RADIO) {
        this.lastSelectedButton = button;
    }
},


//>    @method    toolbar.buttonDeselected()    (A)
// Notification that one of the toolbar buttons was just DEselected
//        @group    selection
//
//        @param    button        (button object)        a member of this.buttons
//<
buttonDeselected : function (button) {
},


//>    @method    toolbar.itemClick() ([A])
//    Called when one of the buttons receives a click event
//        @group    event handling
//        @param    item        (button)        pointer to the button in question
//        @param    itemNum        (number)        number of the button in question
// @visibility external
//<
itemClick : function (item, itemNum) {
},

//>    @method    toolbar.itemDoubleClick() ([A])
//    Called when one of the buttons receives a double-click event
//        @group    event handling
//        @param    item        (button)        pointer to the button in question
//        @param    itemNum        (number)        number of the button in question
// @visibility external
//<
itemDoubleClick : function (item, itemNum) {
},

//>    @method    toolbar.getMouesOverButtonIndex()    (A)
//  @return (number) the number of the button the mouse is currently over,
//                   or -1 for before all buttons, -2 for after all buttons
//                  See also getFocusButtonIndex()
//<
getMouseOverButtonIndex : function () {
    var offset = this.vertical ? this.getOffsetY() : this.getOffsetX();

    if (this.isRTL() || this.align == isc.Canvas.RIGHT) {
        var leftGap = this.getInnerWidth() - this.memberSizes.sum();
        if (leftGap > 0) offset-= leftGap;

    }
    return this.inWhichPosition(this.memberSizes, offset, this.getTextDirection());
},


// Override prepareForDragging to handle dragResize / dragReorder of items in the toolbar.
prepareForDragging : function () {
    // NOTE: we currently set a canDrag, canDragResize, etc flags on our children.  However, we
    // could manage everything from this function instead, eg, pick dragResize if there is a
    // resize edge hit on the child, otherwise dragReorder.

    var EH = this.ns.EH;
    // This custom handling is for events bubbled from a member being drag repositioned
    // (drag reorder) or drag resized.
    //

    var lastTarget = EH.lastEvent.target;
    while (lastTarget.dragTarget) {
        lastTarget = lastTarget.dragTarget;
    }
    var operation = EH.dragOperation;


    if (( (this.canResizeItems && operation == "dragResize")
          || (this.canReorderItems && operation == "drag")
         ) && this.members.contains(lastTarget))
    {

        // If we hit a valid resize edge on a member, the member will have set the dragOperation to
        // dragResize
        if (operation == "dragResize") {
            // for drag resizes on the length axis, do specially managed resizing.  Don't interfere
            // with breadth-axis resize, if enabled
            if ((this.vertical && ["T","B"].contains(EH.resizeEdge)) ||
                (!this.vertical && ["L","R"].contains(EH.resizeEdge)))
            {
                EH.dragOperation = "dragResizeMember";
                // We can just return - prepareForDragging() is bubbled so was already fired
                // on the member and set up EH.dragTarget in this case
                return;
            }
        // otherwise, starting a drag on a button means dragReordering the members.
        } else if (operation == "drag") {
            EH.dragOperation = "dragReorder";
            return;
        }
    }

    return this.Super("prepareForDragging", arguments);
},

// Drag Reordering
// --------------------------------------------------------------------------------------------

// get the position where the button being reordered would be dropped, if dragging stopped at the
// current mouse coordinates
getDropPosition : function () {
    var position = this.getMouseOverButtonIndex();


    var EH = this.ns.EH,
        switchInMiddle = (this.reorderStyle == "explorer" ||
                        (EH.dropTarget && EH.dropTarget.parentElement == this));
    if (switchInMiddle && position >= 0) {
        // if we are over a member, check whether we should switch to the next member or final
        // coordinate
        var buttonSize = this.memberSizes[position],
            offset = (this.vertical ? this.getOffsetY() : this.getOffsetX());


        offset -= this.memberSizes.slice(0, position).sum();
        var oldPosition = position;
        // switch to next coordinate in the middle of the button
        if (offset > buttonSize/2) position++;

        //this.logWarn("oldPosition: " + oldPosition +
        //             ", size: " + buttonSize +
        //             ", offset: " + offset +
        //             ", position: " + position);
    }

    var numMembers = this.members.length,
        maxIndex = (switchInMiddle ? numMembers : numMembers - 1);

    // for reorder/self-drop interactions, when we drag out of the Layout, we revert to the
    // original position.  For external drops, the only remaining case is a coordinate within
    // the Layout, but before all members.
    var revertPosition = this.dragStartPosition || 0,
        selfDrag = EH.dragTarget && EH.dragTarget.parentElement == this;

    // if beyond the last member, but still within the layout rect, convert to last member
    if (position == -2 && this.containsEvent()) {
        position = maxIndex;
    }

    if (position < 0 || position > maxIndex) position = revertPosition;

    // for reorder/self-drop, check canReorder flag
    else if (selfDrag && (this.members[position] && this.members[position].canReorder == false))
    {
        position = revertPosition;
    }
    return position;
},

// sent when button dragging for reordering begins
dragReorderStart : function () {
    var EH = this.ns.EH,
        startButton = EH.dragTarget
    ;

    // if the button's canReorder property is false, it can't be reordered so forget it!
    if (startButton.canReorder == false) return false;



    if (startButton.showDown) startButton.setState(isc.StatefulCanvas.STATE_DOWN);

    // get the item number that reordering started in (NOTE: depended on by observers like LV)
    this.dragStartPosition = this.getButtonNumber(startButton);
    return EH.STOP_BUBBLING;
},

// sent when button moves during drag-reorder
dragReorderMove : function () {
    var EH = this.ns.EH,
        startButton = EH.dragTarget,
        startPosition = this.dragStartPosition,
        currentPosition = this.getDropPosition();

    //this.logWarn("dragReorderMove: position: " + this.getMouseOverButtonIndex() +
    //             ", drop position: " + this.getDropPosition());

    // remember the current position (NOTE: depended on by observers like LV)
    this.dragCurrentPosition = currentPosition;



    // create a temporary order for the members and lay them out in that order
    var members = this.members.duplicate();
    members.slide(startPosition, currentPosition);
    //this.logWarn("startPos: " + startPosition + ", currentPos: " + currentPosition +
    //             "members: " + this.members + ", reordered: " + members);
    // NOTE: tell stackMembers() not to update sizes, since this is a temporary order
    this.stackMembers(members, null, false);

    return EH.STOP_BUBBLING;
},

// sent when button dragging for reordering ends
dragReorderStop : function () {
    var EH = this.ns.EH,
        startButton = EH.dragTarget,
        startPosition = this.dragStartPosition,
        currentPosition = this.dragCurrentPosition;

    startButton.setState(isc.StatefulCanvas.STATE_UP);



    if (currentPosition == startPosition) return false;

    // if we're supposed to actually reorder on drop, reorder now
    if (this.reorderOnDrop) this.reorderItem(currentPosition, startPosition);

    // notify observers
    if (this.itemDragReordered) this.itemDragReordered(startPosition, currentPosition);

    return EH.STOP_BUBBLING;
},

//>    @method    toolbar.dragStop()    (A)
//        @group    events, dragging
//            handle a dragStop event
//<
dragStop : function () {
    // NOTE: called at the end of an inter-toolbar move iteraction, not a dragReorder
    var EH = this.ns.EH,
        startButton = EH.dragTarget,
        startPosition = this.dragStartPosition;

    startButton.setState(isc.StatefulCanvas.STATE_UP);
    this.hideDropLine();

    return EH.STOP_BUBBLING;
},

// reorder an item programmatically
reorderItem : function (itemNum, newPosition) {
    this.reorderItems(itemNum, itemNum+1, newPosition);
},

// reorder multiple items programmatically
reorderItems : function (start, end, newPosition) {
    // reorder the button config
    this.buttons.slideRange(start, end, newPosition);
    // and array of button widgets
    this.reorderMembers(start, end, newPosition);
    // update which buttons can resize
    this.setResizeRules();
},



// Drag Resizing (of buttons)
// --------------------------------------------------------------------------------------------

// sent whem button dragging for resizing begins
dragResizeMemberStart : function () {
    var EH = this.ns.EH,
        item = EH.dragTarget,
        itemNum = this.getButtonNumber(item),
        rtl = this.isRTL();

    // if dragging from the left edge, switch to the previous item and drag resize from its right
    var offsetDrag = false;
    if ((!rtl && EH.resizeEdge == "L") || (rtl && EH.resizeEdge == "R")) {
        offsetDrag = true;
        itemNum--;
        EH.resizeEdge = (rtl ? "L" : "R");
    } else if (EH.resizeEdge == "T") {
        offsetDrag = true;
        itemNum--;
        EH.resizeEdge = "B";
    }
    // if not in a valid item, forget it
    if (itemNum < 0 || itemNum >= this.members.length || item == null) return false;
    EH.dragTarget = item = this.members[itemNum];


    item._oldCanDrop = item.canDrop;
    item.canDrop = false;

    // NOTE: depended upon by observers (ListGrid)
    this._resizePosition = itemNum;

    if (item.showDown) item.setState(isc.StatefulCanvas.STATE_DOWN);
    if (offsetDrag) {
        var mouseDownItem = this.members[itemNum+1];
        if (mouseDownItem) mouseDownItem.setState(isc.StatefulCanvas.STATE_UP);
    }
    return EH.STOP_BUBBLING;
},

// sent whem item moves during drag-resizing
dragResizeMemberMove : function () {
    var EH = this.ns.EH,
        item = EH.dragTarget;

    // resize the item
    item.resizeToEvent();
    // do an immediate redraw for responsiveness
    item.redrawIfDirty("dragResize");
    return EH.STOP_BUBBLING;
},

// sent whem item dragging for resizing ends
dragResizeMemberStop : function () {
    var EH = this.ns.EH,
        item = EH.dragTarget;

    // restore old canDrop setting
    item.canDrop = item._oldCanDrop;

    // change appearance back
    item.setState(isc.StatefulCanvas.STATE_UP);

    // resize
    item.resizeToEvent();

    // record the new size
    var newSize = (this.vertical ? item.getHeight() : item.getWidth());
    this.resizeItem(this._resizePosition, newSize);

    if (this.itemDragResized) this.itemDragResized(this._resizePosition, newSize); // for observers
    return EH.STOP_BUBBLING;
},

// resize an item programmatically
resizeItem : function (itemNum, newSize) {
    // resize the item
    var item = this.members[itemNum];
    if (this.vertical) item.setHeight(newSize);
    else item.setWidth(newSize);
}

});

isc.Toolbar.registerStringMethods({
// itemClick handler for when an item is clicked
// (JSDoc comment next to default implementation)
itemClick : "item,itemNum",

//> @method toolbar.itemDragResized
// Observable, overrideable method - called when one of the Toolbar buttons is drag resized.
//
// @param itemNum (number) the index of the item that was resized
// @param newSize (number) the new size of the item
//
// @visibility external
//<
itemDragResized : "itemNum,newSize",

// Sent when an item is drag reordered.  This can be observed to have a related widget
// rearrange itself.
itemDragReordered : "itemNum,newPosition"
});











//>    @class    ImgButton
// A Img that behaves like a button, going through up/down/over state transitions in response to
// user events.  Supports an optional title, and will auto-size to accommodate the title text if
// <code>overflow</code> is set to "visible".
// <P>
// Example uses are Window minimize/close buttons.
//
// @treeLocation Client Reference/Control
// @visibility external
//<

// class for Stretchable image buttons
isc.defineClass("ImgButton", "Img").addProperties({

    // Various properties documented on StatefulCanvas that affect all buttons
    // NOTE: This block is included in Button, ImgButton, and StrechlImgButton.
    //       If you make changes here, make sure you duplicate it to the other
    //       classes.
    //
    // End of this block is marked with: END StatefulCanvas @include block
    // =========================================================================

    // Title
    //------
    //> @attr imgButton.title
    // @include statefulCanvas.title
    // @visibility external
    //<
    //> @attr imgButton.clipTitle
    // @include Button.clipTitle
    // @group appearance
    //<
    clipTitle:true,
    //> @attr imgButton.hiliteAccessKey (boolean : null : IRW)
    // @include statefulCanvas.hiliteAccessKey
    // @visibility external
    //<

    //>    @method    imgButton.getTitle()    (A)
    // @include statefulCanvas.getTitle
    // @visibility external
    //<
    //>    @method    imgButton.setTitle()
    // @include statefulCanvas.setTitle
    // @visibility external
    //<

    //> @attr imgButton.showClippedTitleOnHover
    // @include Button.showClippedTitleOnHover
    // @group hovers
    // @visibility external
    //<
    showClippedTitleOnHover:false,
    _canHover:true,

    // Icon
    //------
    //> @attr imgButton.icon
    // @include statefulCanvas.icon
    // @visibility external
    //<
    //> @attr imgButton.iconSize
    // @include statefulCanvas.iconSize
    // @visibility external
    //<
    //> @attr imgButton.iconWidth
    // @include statefulCanvas.iconWidth
    // @visibility external
    //<
    //> @attr imgButton.iconHeight
    // @include statefulCanvas.iconHeight
    // @visibility external
    //<
    //> @attr imgButton.iconOrientation
    // @include statefulCanvas.iconOrientation
    // @visibility external
    //<
    //> @attr imgButton.iconAlign
    // @include statefulCanvas.iconAlign
    // @visibility external
    //<
    //> @attr imgButton.iconSpacing
    // @include statefulCanvas.iconSpacing
    // @visibility external
    //<
    //> @attr imgButton.showDisabledIcon
    // @include statefulCanvas.showDisabledIcon
    // @visibility external
    //<
    //> @attr imgButton.showRollOverIcon
    // @include statefulCanvas.showRollOverIcon
    // @visibility external
    //<
    //> @attr imgButton.showFocusedIcon
    // @include statefulCanvas.showFocusedIcon
    // @visibility external
    //<
    //> @attr imgButton.showDownIcon
    // @include statefulCanvas.showDownIcon
    // @visibility external
    //<
    //> @attr imgButton.showSelectedIcon
    // @include statefulCanvas.showSelectedIcon
    // @visibility external
    //<
    //> @method imgButton.setIconOrientation()
    // @include statefulCanvas.setIconOrientation
    // @visibility external
    //<
    //> @method imgButton.setIcon()
    // @include statefulCanvas.setIcon
    // @visibility external
    //<

    // AutoFit
    //--------
    //> @attr imgButton.autoFit
    // @include statefulCanvas.autoFit
    // @visibility external
    //<
    //> @method imgButton.setAutoFit()
    // @include statefulCanvas.setAutoFit
    // @visibility external
    //<

    // baseStyle
    //----------
    //> @attr imgButton.baseStyle (CSSStyleName : "imgButton" : IRW)
    // @include statefulCanvas.baseStyle
    // @visibility external
    //<
    baseStyle:"imgButton",
    //> @method imgButton.setBaseStyle()
    // @include statefulCanvas.setBaseStyle
    // @visibility external
    //<

    // selection
    //----------
    //> @attr imgButton.selected
    // @include statefulCanvas.selected
    // @visibility external
    //<
    //> @method imgButton.select()
    // @include statefulCanvas.select
    // @visibility external
    //<
    //> @method imgButton.deselect()
    // @include statefulCanvas.select
    // @visibility external
    //<
    //> @method imgButton.isSelected()
    // @include statefulCanvas.isSelected
    // @visibility external
    //<
    //> @method imgButton.setSelected()
    // @include statefulCanvas.select
    // @visibility external
    //<

    // radioGroup
    //-----------
    //> @attr imgButton.radioGroup
    // @include statefulCanvas.radioGroup
    // @visibility external
    // @example buttonRadioToggle
    //<
    //> @method imgButton.addToRadioGroup()
    // @include statefulCanvas.addToRadioGroup
    // @visibility external
    //<
    //> @method imgButton.removeFromRadioGroup()
    // @include statefulCanvas.removeFromRadioGroup
    // @visibility external
    //<
    //> @attr imgButton.actionType
    // @include statefulCanvas.actionType
    // @visibility external
    // @example buttonRadioToggle
    //<
    //> @method imgButton.setActionType()
    // @include statefulCanvas.setActionType
    // @visibility external
    //<
    //> @method imgButton.getActionType()
    // @include statefulCanvas.getActionType
    // @visibility external
    //<

    // state
    //------
    //> @attr imgButton.state
    // @include statefulCanvas.state
    // @visibility external
    //<
    //> @method imgButton.setState()
    // @include statefulCanvas.setState
    // @visibility external
    //<
    //> @method imgButton.setDisabled()
    // @include statefulCanvas.setDisabled
    // @visibility external
    //<

    //> @method imgButton.getState()
    // @include statefulCanvas.getState
    // @visibility external
    //<
    //> @attr imgButton.showDisabled
    // @include statefulCanvas.showDisabled
    // @visibility external
    //<
    //> @attr imgButton.showDown
    // @include statefulCanvas.showDown
    // @visibility external
    //<
    showDown:true,
    //> @attr imgButton.showFocus
    // @include statefulCanvas.showFocus
    // @visibility external
    //<
    //> @attr imgButton.showFocused
    // @include statefulCanvas.showFocused
    // @visibility external
    //<
    showFocused:true,
    //> @attr imgButton.showRollOver
    // @include statefulCanvas.showRollOver
    // @visibility external
    //<
    showRollOver:true,


    // alignment
    //----------
    //> @attr imgButton.align
    // @include statefulCanvas.align
    // @visibility external
    //<
    //> @attr imgButton.valign
    // @include statefulCanvas.valign
    // @visibility external
    //<


    // Button.action
    //> @method ImgButton.action()
    // @include statefulCanvas.action
    // @visibility external
    //<

    // ================= END StatefulCanvas @include block =============== //


    // Label
    // ---------------------------------------------------------------------------------------


    //> @attr ImgButton.showTitle (Boolean : false : [IRWA])
    // @include StatefulCanvas.showTitle
    // @visibility external
    //<
    showTitle:false,

    // Match the standard button's cursor
    cursor:isc.Button._instancePrototype.cursor,

    //>    @attr    ImgButton.labelHPad  (number : null : IRW)
    // Horizontal padding to be applied to this widget's label. If this value is null,
    // the label will be given a horizontal padding of zero.
    // <p>
    // The specified amount of padding is applied to the left and right edges of the button, so
    // the total amount of padding is 2x the specified value.
    //
    // @visibility external
    //<

    //>    @attr    ImgButton.labelVPad  (number : null : IRW)
    // Vertical padding to be applied to this widget's label. If this value is null,
    // the label will be given a vertial padding of zero.
    // <p>
    // The specified amount of padding is applied to the top and bottom edges of the button, so
    // the total amount of padding is 2x the specified value.
    //
    // @visibility external
    //<
    // Note: the labelHPad / vPad are inherited from the StatefulCanvas implementation - this will
    // actually check for labelLengthPad / labelBreadthPad and then be either zero or the
    // specified capSize for the widget.
    // However labelLengthPad / BreadthPad are not anticipated to be set for this class and
    // the capSize is defaulted to zero in StatefulCanvas.js so we can accurately doc the padding
    // as just defaulting to zero.

    // States
    // ---------------------------------------------------------------------------------------
    //>    @attr    ImgButton.src        (SCImgURL : "[SKIN]/ImgButton/button.png" : IRW)
    // @include Img.src
    // @visibility external
    // @example buttonAppearance
    //<
    src:"[SKIN]/ImgButton/button.png",

    canFocus:true,

    //>    @attr    isc.ImgButton.overflow      (string : "hidden" : RW)
    // Clip by default, because expanding to the label (if present) is likely to distort image
    //<
    overflow:isc.Canvas.HIDDEN

});

isc.ImgButton.addMethods({

getCanHover : function (a, b, c) {
    return this._canHover || this.invokeSuper(isc.ImgButton, "getCanHover", a, b, c);
},

//> @method imgButton.titleClipped() (A)
// Is the title of this button clipped?
// @return (boolean) whether the title is clipped.
// @visibility external
//<
titleClipped : function () {
    return (this.label == null ? false : this.label.titleClipped());
},

defaultTitleHoverHTML : function () {
    return (this.label == null ? null : this.label.defaultTitleHoverHTML());
},

//> @method imgButton.titleHoverHTML()
// Returns the HTML that is displayed by the default +link{ImgButton.titleHover(),titleHover}
// handler. Return null or an empty string to cancel the hover.
// <var class="smartgwt"><p>Use <code>setTitleHoverFormatter()</code> to provide a custom
// implementation.</var>
// @param defaultHTML (HTMLString) the HTML that would have been displayed by default
// @return (HTMLString) HTML to be displayed in the hover. If null or an empty string, then the hover
// is canceled.
// @visibility external
//<
titleHoverHTML : function (defaultHTML) {
    return defaultHTML;
},

handleHover : function (a, b, c) {
    // If there is a prompt, prefer the standard hover handling.
    if (this.canHover == null && this.prompt) return this.invokeSuper(isc.ImgButton, "handleHover", a, b, c);

    if (!this.showClippedTitleOnHover || !this.titleClipped()) {
        if (this.canHover) return this.invokeSuper(isc.ImgButton, "handleHover", a, b, c);
        else return;
    }

    if (this.titleHover && this.titleHover() == false) return;

    var HTML = this.titleHoverHTML(this.defaultTitleHoverHTML());
    if (HTML != null && !isc.isAn.emptyString(HTML)) {
        var hoverProperties = this._getHoverProperties();
        isc.Hover.show(HTML, hoverProperties, null, this);
    }
}

});

isc.ImgButton.registerStringMethods({
    //> @method imgButton.titleHover()
    // Optional stringMethod to fire when the user hovers over this button and the title is
    // clipped. If +link{ImgButton.showClippedTitleOnHover} is true, the default behavior is to
    // show a hover canvas containing the HTML returned by +link{ImgButton.titleHoverHTML()}.
    // Return false to suppress this default behavior.
    // @return (boolean) false to suppress the standard hover
    // @see ImgButton.titleClipped()
    // @group hovers
    // @visibility external
    //<
    titleHover:""
});









//>    @class    StretchImgButton
// A StretchImg that behaves like a button, going through up/down/over state transitions in response
// to user events.  Supports an optional title, and will auto-size to accommodate the title text if
// <code>overflow</code> is set to "visible".
// <P>
// Examples of use include fancy buttons, poplist headers, and tabs.
//
// @treeLocation Client Reference/Control
// @visibility external
//<

isc.defineClass("StretchImgButton", "StretchImg").addProperties({

    // Various properties documented on StatefulCanvas that affect all buttons
    // NOTE: This block is included in Button, ImgButton, and StretchImgButton.
    //       If you make changes here, make sure you duplicate it to the other
    //       classes.
    //
    // End of this block is marked with: END StatefulCanvas @include block
    // =========================================================================

    // Title
    //------
    //> @attr stretchImgButton.title
    // @include statefulCanvas.title
    // @visibility external
    //<
    //> @attr stretchImgButton.clipTitle
    // @include Button.clipTitle
    // @group appearance
    //<
    clipTitle:true,
    //>    @method    stretchImgButton.getTitle()    (A)
    // @include statefulCanvas.getTitle
    // @visibility external
    //<
    //>    @method    stretchImgButton.setTitle()
    // @include statefulCanvas.setTitle
    // @visibility external
    //<
    //> @attr stretchImgButton.showClippedTitleOnHover
    // @include Button.showClippedTitleOnHover
    // @group hovers
    // @visibility external
    //<
    showClippedTitleOnHover:false,
    _canHover:true,

    //> @attr   stretchImgButton.wrap   (boolean : null : IRW)
    // Should the title for this button wrap? If unset, default behavior is to allow wrapping
    // if this.vertical is true, otherwise disallow wrapping
    // @visibility external
    //<


    // Icon
    //------

    // set useEventParts to true so we can have a separate iconClick method
    useEventParts:true,

    //> @attr stretchImgButton.icon
    // @include statefulCanvas.icon
    // @visibility external
    //<
    //> @attr stretchImgButton.iconSize
    // @include statefulCanvas.iconSize
    // @visibility external
    //<
    //> @attr stretchImgButton.iconWidth
    // @include statefulCanvas.iconWidth
    // @visibility external
    //<
    //> @attr stretchImgButton.iconHeight
    // @include statefulCanvas.iconHeight
    // @visibility external
    //<
    //> @attr stretchImgButton.iconOrientation
    // @include statefulCanvas.iconOrientation
    // @visibility external
    //<
    //> @attr stretchImgButton.iconAlign
    // @include statefulCanvas.iconAlign
    // @visibility external
    //<
    //> @attr stretchImgButton.iconSpacing
    // @include statefulCanvas.iconSpacing
    // @visibility external
    //<
    //> @attr stretchImgButton.showDisabledIcon
    // @include statefulCanvas.showDisabledIcon
    // @visibility external
    //<
    //> @attr stretchImgButton.showRollOverIcon
    // @include statefulCanvas.showRollOverIcon
    // @visibility external
    //<
    //> @attr stretchImgButton.showFocusedIcon
    // @include statefulCanvas.showFocusedIcon
    // @visibility external
    //<
    //> @attr stretchImgButton.showDownIcon
    // @include statefulCanvas.showDownIcon
    // @visibility external
    //<
    //> @attr stretchImgButton.showSelectedIcon
    // @include statefulCanvas.showSelectedIcon
    // @visibility external
    //<
    //> @method stretchImgButton.setIconOrientation()
    // @include statefulCanvas.setIconOrientation
    // @visibility external
    //<
    //> @method stretchImgButton.setIcon()
    // @include statefulCanvas.setIcon
    // @visibility external
    //<

    // AutoFit
    //--------
    //> @attr stretchImgButton.autoFit
    // @include statefulCanvas.autoFit
    // @visibility external
    //<
    //> @method stretchImgButton.setAutoFit()
    // @include statefulCanvas.setAutoFit
    // @visibility external
    //<

    // baseStyle
    //----------
    //> @attr stretchImgButton.baseStyle (CSSStyleName : "stretchImgButton" : IRW)
    // @include statefulCanvas.baseStyle
    // @visibility external
    //<
    baseStyle:"stretchImgButton",
    //> @method stretchImgButton.setBaseStyle()
    // @include statefulCanvas.setBaseStyle
    // @visibility external
    //<

    //>    @attr stretchImgButton.titleStyle (CSSStyleName : null : IRW)
    // CSS style applied to the title text only.  Defaults to +link{baseStyle} when unset.
    // <P>
    // With a separate <code>titleStyle</code> and +link{baseStyle} set, you can provide a
    // backgroundColor via <code>baseStyle</code> that will allow translucent .png media to be
    // "tinted" by the underlying background color, so that a single set of media can provide
    // range of color options.  In this usage, the <code>titleStyle</code> should generally not
    // specify a background color as this would block out the media that appears behind the
    // title.
    //
    // @visibility external
    //<

    //>    @method stretchImgButton.setTitleStyle()
    // Sets the +link{titleStyle}, which is applied to the title text.
    // @param style (CSSStyleName) new title style
    // @visibility external
    //<

    //> @attr stretchImgButton.labelSkinImgDir (URL : null : IRWA)
    // Specifies a skinImgDir to apply to the label containing the title of this
    // StretchImgButton. May be null in which case <code>this.skinImgDir</code>
    // will be applied to the label as well.
    // <P>
    // Note that icons displayed in the title may make use of the skin img dir set here
    // @visibility external
    //<

    //> @method stretchImgButton.setLabelSkinImgDir()
    // setter for +link{stretchImgButton.labelSkinImgDir}.
    // @param URL (URL) new skin img dir to apply to the label holding title text for
    //   this widget.
    // @visibility external
    //<

    // selection
    //----------
    //> @attr stretchImgButton.selected
    // @include statefulCanvas.selected
    // @visibility external
    //<
    //> @method stretchImgButton.select()
    // @include statefulCanvas.select
    // @visibility external
    //<
    //> @method stretchImgButton.deselect()
    // @include statefulCanvas.select
    // @visibility external
    //<
    //> @method stretchImgButton.isSelected()
    // @include statefulCanvas.isSelected
    // @visibility external
    //<
    //> @method stretchImgButton.setSelected()
    // @include statefulCanvas.select
    // @visibility external
    //<

    // radioGroup
    //-----------
    //> @attr stretchImgButton.radioGroup
    // @include statefulCanvas.radioGroup
    // @visibility external
    //<
    //> @method stretchImgButton.addToRadioGroup()
    // @include statefulCanvas.addToRadioGroup
    // @visibility external
    //<
    //> @method stretchImgButton.removeFromRadioGroup()
    // @include statefulCanvas.removeFromRadioGroup
    // @visibility external
    //<
    //> @attr stretchImgButton.actionType
    // @include statefulCanvas.actionType
    // @visibility external
    //<
    //> @method stretchImgButton.setActionType()
    // @include statefulCanvas.setActionType
    // @visibility external
    //<
    //> @method stretchImgButton.getActionType()
    // @include statefulCanvas.getActionType
    // @visibility external
    //<

    // state
    //------
    //> @attr stretchImgButton.state
    // @include statefulCanvas.state
    // @visibility external
    //<
    //> @method stretchImgButton.setState()
    // @include statefulCanvas.setState
    // @visibility external
    //<
    //> @method stretchImgButton.setDisabled()
    // @include statefulCanvas.setDisabled
    // @visibility external
    //<
    //> @method stretchImgButton.getState()
    // @include statefulCanvas.getState
    // @visibility external
    //<
    //> @attr stretchImgButton.showDisabled
    // @include statefulCanvas.showDisabled
    // @visibility external
    //<
    //> @attr stretchImgButton.showDown
    // @include statefulCanvas.showDown
    // @visibility external
    //<
    showDown:true,
    //> @attr stretchImgButton.showFocus
    // @include statefulCanvas.showFocus
    // @visibility external
    //<
    //> @attr stretchImgButton.showFocused
    // @include statefulCanvas.showFocused
    // @visibility external
    //<
    showFocused:true,
    //> @attr stretchImgButton.showRollOver
    // @include statefulCanvas.showRollOver
    // @visibility external
    //<
    showRollOver:true,

    // alignment
    //----------
    //> @attr stretchImgButton.align
    // @include statefulCanvas.align
    // @visibility external
    //<
    //> @attr stretchImgButton.valign
    // @include statefulCanvas.valign
    // @visibility external
    //<


    // Button.action
    //> @method StretchImgButton.action()
    // @include statefulCanvas.action
    // @visibility external
    //<

    // ================= END StatefulCanvas @include block =============== //


    // Label
    // ---------------------------------------------------------------------------------------

    //> @attr StretchImgButton.showTitle (Boolean : true : IRW)
    // @include StatefulCanvas.showTitle
    // @visibility external
    //<
    showTitle:true,

    //>    @attr    StretchImgButton.labelHPad  (number : null : IRW)
    // The padding for a StretchImgButton's label is determined as follows.
    // <P>
    // If <code>labelHPad</code> is set it will specify the horizontal padding applied to the
    // label. Similarly if <code>labelVPad</code> is set it will specify the vertical padding
    // for the label, regardless of the button's +link{StretchImgButton.vertical,vertical} setting.
    // <P>
    // Otherwise <code>labelLengthPad</code> can be set to specify the label padding along the
    // length axis (ie: horizontal padding if +link{StretchImgButton.vertical} is false,
    // otherwise vertical padding), and
    // <code>labelBreadthPad</code> can be set to specify the label padding along the other axis.
    // <P>
    // Otherwise the padding on the length axis will match the +link{StretchImgButton.capSize} and
    // will be set to zero on the breadth axis.
    // <P>
    // So by default the label will be sized to match the center image of the StretchImgButton, but
    // these settings allow the label to partially or wholly overlap the caps.
    // @visibility external
    //<


    //>    @attr    StretchImgButton.labelVPad  (number : null : IRW)
    // @include StretchImgButton.labelHPad
    // @visibility external
    //<

    //>    @attr    StretchImgButton.labelLengthPad  (number : null : IRW)
    // @include StretchImgButton.labelHPad
    // @visibility external
    //<

    //>    @attr    StretchImgButton.labelBreadthPad  (number : null : IRW)
    // @include StretchImgButton.labelHPad
    // @visibility external
    //<

    //> @attr stretchImgButton.hiliteAccessKey (Boolean : true: IRW)
    // @include statefulCanvas.hiliteAccessKey
    // @visibility external
    //<
    hiliteAccessKey:true,

    // States
    // ---------------------------------------------------------------------------------------

    //>    @attr    StretchImgButton.src        (SCImgURL : "button.gif" : IRW)
    // Base URL for the image.  By default, StretchImgButtons consist of three image parts: A
    // start image (displayed at the top or left), a scalable central image and an end image
    // displayed at the bottom or right.
    // <P>
    // The images displayed in the stretchImgButton are derived from this property in the
    // following way:
    // <P>
    // <ul>
    // <li> When the button is in its standard state the suffixes "_start", "_end" and
    //      "_stretch" are applied to the src (before the file extension), so by default
    //      the images displayed will be "button_start.gif" (sized to be
    //      <code>this.capSize</code> by the specified width of the stretchImgButton),
    //      "button_stretch.gif" (stretched to the necessary width) and "button_end.gif"
    //      (sized the same as the start image).
    // <li> As the button's state changes, the images will have suffixes appended <b>before</b>
    //      the "_start" / "_end" / "_stretch" to represent the button state. Possible states
    //      are "Down", "Over", "Selected" "Focused" and "Disabled". Note that "Selected" and
    //      "Focused" are compound states which may be applied in addition to "Down" etc.
    // </ul>
    // For example the center piece of a selected stretchImgButton with the mouse hovering
    // over it might have the URL: <code>"button_Selected_Down_stretch.gif"</code>.
    // <P>
    // Media should be present for each possible state of the _start, _end and _stretch images.
    //
    // @visibility external
    //<
    src:"[SKIN]/button/button.png",

    //>    @attr    StretchImgButton.vertical        (Boolean : false : IRW)
    // Default is a horizontal button.  Vertical StretchImgButtons are allowed, but title text,
    // if any, will not be automatically rotated.
    //
    // @group appearance
    // @visibility external
    //<
    vertical:false,

    //>    @attr    StretchImgButton.capSize        (number : 12 : IRW)
    // How big are the end pieces by default
    // @group appearance
    // @visibility external
    //<
    capSize:12,

    // Override autoFitDirection - we only want the button to resize horizontally since
    // otherwise the media gets stretched.
    autoFitDirection:"horizontal",

    // ---------------------------------------------------------------------------------------
    // Match the standard button's cursor
    cursor:isc.Button._instancePrototype.cursor,

    canFocus:true

});

isc.StretchImgButton.addMethods({

getCanHover : function (a, b, c) {
    return this._canHover || this.invokeSuper(isc.StretchImgButton, "getCanHover", a, b, c);
},

//> @method stretchImgButton.titleClipped() (A)
// Is the title of this button clipped?
// @return (boolean) whether the title is clipped.
// @visibility external
//<
titleClipped : function () {
    return (this.label == null ? false : this.label.titleClipped());
},

defaultTitleHoverHTML : function () {
    return (this.label == null ? null : this.label.defaultTitleHoverHTML());
},

//> @method stretchImgButton.titleHoverHTML()
// Returns the HTML that is displayed by the default +link{StretchImgButton.titleHover(),titleHover}
// handler. Return null or an empty string to cancel the hover.
// <var class="smartgwt"><p>Use <code>setTitleHoverFormatter()</code> to provide a custom
// implementation.</var>
// @param defaultHTML (HTMLString) the HTML that would have been displayed by default
// @return (HTMLString) HTML to be displayed in the hover. If null or an empty string, then the hover
// is canceled.
// @visibility external
//<
titleHoverHTML : function (defaultHTML) {
    return defaultHTML;
},

handleHover : function (a, b, c) {
    // If there is a prompt, prefer the standard hover handling.
    if (this.canHover == null && this.prompt) return this.invokeSuper(isc.StretchImgButton, "handleHover", a, b, c);

    if (!this.showClippedTitleOnHover || !this.titleClipped()) {
        if (this.canHover) return this.invokeSuper(isc.StretchImgButton, "handleHover", a, b, c);
        else return;
    }

    if (this.titleHover && this.titleHover() == false) return;

    var HTML = this.titleHoverHTML(this.defaultTitleHoverHTML());
    if (HTML != null && !isc.isAn.emptyString(HTML)) {
        var hoverProperties = this._getHoverProperties();
        isc.Hover.show(HTML, hoverProperties, null, this);
    }
}

});

isc.StretchImgButton.registerStringMethods({
    //> @method stretchImgButton.iconClick()
    // If this button is showing an +link{StretchImgButton.icon, icon}, a separate click
    // handler for the icon may be defined as <code>this.iconClick</code>.
    // Returning false will suppress the standard button click handling code.
    // @return (boolean) false to suppress the standard button click event
    // @group buttonIcon
    // @visibility external
    //<
    iconClick:"",

    //> @method stretchImgButton.titleHover()
    // Optional stringMethod to fire when the user hovers over this button and the title is
    // clipped. If +link{StretchImgButton.showClippedTitleOnHover} is true, the default behavior is to
    // show a hover canvas containing the HTML returned by +link{StretchImgButton.titleHoverHTML()}.
    // Return false to suppress this default behavior.
    // @return (boolean) false to suppress the standard hover
    // @see StretchImgButton.titleClipped()
    // @group hovers
    // @visibility external
    //<
    titleHover:""
})






//>    @class    ToolStrip
//
// Base class for creating toolstrips like those found in browsers and office applications: a
// mixed set of controls including +link{ImgButton,icon buttons},
// +link{button.radioGroup,radio button groups}, +link{MenuButton,menus},
// +link{ComboBoxItem,comboBoxes}, +link{LayoutSpacer,spacers}, +link{Label,status displays} and
// +link{SelectItem,drop-down selects}.
// <P>
// All of the above components are placed in the +link{ToolStrip.members,members array} to form
// a ToolStrip.  Note that the +link{FormItem,FormItems} mentioned above (ComboBox and
// drop-down selects) need to be placed within a +link{DynamicForm} as usual.
// <P>
// The special strings "separator" and "resizer" can be placed in the members array to create
// separators and resizers respectively.
// <P>
// Also see the +explorerExample{toolstrip} example in the Feature Explorer.
//
// @treeLocation Client Reference/Layout
// @visibility external
// @example toolstrip
//<

isc.defineClass("ToolStrip", "Layout").addProperties({

    //> @attr toolStrip.members (Array of Canvas : null : IR)
    // Array of components that will be contained within this Toolstrip, like
    // +link{Layout.members}, with the following special behaviors:
    // <ul>
    // <li>the String "separator" will cause a separator to be created (instance of
    // +link{separatorClass})
    // <li>the String "resizer" will cause a resizer to be created (instance of
    // +link{resizeBarClass}).  This is equivalent to setting
    // +link{canvas.showResizeBar,showResizeBar:true} on the preceding member.
    // </ul>
    //
    // @visibility external
    // @example toolstrip
    //<

    //> @attr toolStrip.height (Number : 20 : IRW)
    // ToolStrips set a default +link{Canvas.height,height} to avoid being stretched by
    // containing layouts.
    // @group sizing
    // @visibility external
    //<
    height: 20,

    defaultWidth: 250,

    //> @attr toolStrip.styleName (CSSClassName : "toolStrip" : IRW)
    // CSS class applied to this toolstrip.
    // <P>
    // Note that if +link{toolStrip.vertical} is true for this toolStrip,
    // +link{toolStrip.verticalStyleName} will be used instead of this value if it is non-null.
    //<
    styleName: "toolStrip",

    //> @attr toolStrip.verticalStyleName (CSSClassName : null : IR)
    // Default stylename to use if +link{toolStrip.vertical,this.vertical} is true.
    // If unset, the standard +link{styleName} will be used for both vertical and horizontal
    // toolstrips.
    // <P>
    // Note that this property only applies to the widget at init time. To modify the
    // styleName after this widget has been initialized, you should
    // simply call +link{canvas.setStyleName(),setStyleName()} rather than updating this
    // property.
    // @group appearance
    // @visibility external
    //<

    //>    @attr    toolStrip.vertical        (Boolean : false : IR)
    // Indicates whether the components are drawn horizontally from left to right (false), or
    // vertically from top to bottom (true).
    //        @group    appearance
    //      @visibility external
    //<
    vertical:false,

    //> @attr toolStrip.resizeBarClass (String : "ToolStripResizer" : IR)
    // Customized resizeBar with typical appearance for a ToolStrip.
    // @visibility external
    //<
    // NOTE: class definition in Splitbar.js
    resizeBarClass: "ToolStripResizer",

    //> @attr toolStrip.resizeBarSize (int : 14 : IRA)
    // Thickness of the resizeBars in pixels.
    // @visibility external
    //<
    resizeBarSize: 14,

    //> @attr toolStrip.separatorClass (String : "ToolStripSeparator" : IR)
    // Class to create when the string "separator" appears in +link{toolStrip.members}.
    // @visibility external
    //<
    separatorClass : "ToolStripSeparator",

    //> @attr toolStrip.separatorSize (int : 8 : IR)
    // Separator thickness in pixels
    // @visibility external
    //<
    separatorSize : 8,

    //> @attr toolStrip.showGroupTitle (Boolean : true : IR)
    // If set, this attribute affects whether +link{class:ToolStripGroup, ToolStripGroups}
    // in this ToolStrip show their header control.  You can override this at the
    // +link{toolStripGroup.showTitle, individual ToolStripGroup} level.
    // @visibility external
    //<
    showGroupTitle : true,

    //> @attr toolStrip.groupTitleAlign (Alignment : "center" : IR)
    // If set, this attribute affects the alignment of the titles in
    // +link{class:ToolStripGroup, ToolStripGroups}.  You can override this at the
    // +link{toolStripGroup.titleAlign, individual ToolStripGroup} level.
    // @visibility external
    //<
    groupTitleAlign : "center",

    //> @attr toolStrip.groupTitleOrientation (VerticalAlignment : "top" : IR)
    // If set, this attribute affects the orientation of the titles in
    // +link{class:ToolStripGroup, ToolStripGroups}.  You can override this at the
    // +link{toolStripGroup.titleAlign, individual ToolStripGroup} level.
    // @visibility external
    //<
    groupTitleOrientation : "top",

    initWidget : function (a,b,c,d,e,f) {
        this.members = this._convertMembers(this.members);
        this.invokeSuper(isc.ToolStrip, this._$initWidget, a,b,c,d,e,f);

        if (this.vertical && this.verticalStyleName != null) {
            this.setStyleName(this.verticalStyleName);
        }

    },

    // support special "separator" and "resizer" strings
    _convertMembers : function (members) {
        var separatorClass = isc.ClassFactory.getClass(this.separatorClass);
        if (members == null) return null;
        var newMembers = [];
        for (var i = 0; i < members.length; i++) {
            var m = members[i];
            if (m == "separator") {
                var separator = separatorClass.createRaw();
                separator.autoDraw = false;
                separator.vertical = !this.vertical;
                if (this.vertical) {
                    separator.height = this.separatorSize;
                } else {
                    separator.width = this.separatorSize;
                }
                separator.completeCreation();
                newMembers.add(isc.SGWTFactory.extractFromConfigBlock(separator));
            } else if (m == "resizer" && i > 0) {
                members[i-1].showResizeBar = true;
            // handle being passed an explicitly created ToolStripResizer instance.
            // Incorrect usage but plausible.
            } else if (m == "starSpacer") {
                newMembers.add(isc.LayoutSpacer.create({width: "*"}));
            } else if (isc.isA.ToolStripResizer(m) && i > 0) {
                members[i-1].showResizeBar = true;
                m.destroy();
            } else {
                // handle being passed an explicitly created ToolStripSeparator instance.
                // Incorrect usage but plausible.
                if (isc.isA.ToolStripSeparator(m)) {
                    var separator = m;
                    separator.vertical = !this.vertical;
                    separator.setSrc(this.vertical ? separator.hSrc : separator.vSrc);
                    if (this.vertical) {
                        separator.setHeight(this.separatorSize);
                    } else {
                        separator.setWidth(this.separatorSize);
                    }
                    separator.markForRedraw();
                } else if (isc.isA.ToolStripGroup(m)) {
                    // apply some overrides here
                    if (!m.showTitle) m.setShowTitle(this.showGroupTitle);
                    if (!m.titleAlign) m.setTitleAlign(this.groupTitleAlign);
                    if (!m.titleOrientation) m.setTitleOrientation(this.groupTitleOrientation);
                } else {
                    // punt to Canvas heuristics
                    m = this.createCanvas(m);
                }

                newMembers.add(m);
            }
        }
        return newMembers;
    },
    addMembers : function (newMembers, position, dontAnimate,d,e) {
        if (!newMembers) return;
        if (!isc.isAn.Array(newMembers)) newMembers = [newMembers];

        var firstMember = newMembers[0],
            isResizerWidget = isc.isA.ToolStripResizer(firstMember);
        if (firstMember == "resizer" || isResizerWidget) {
            position = position || this.members.length;
            var precedingPosition = Math.min(position, this.members.length) -1;
            if (precedingPosition > 0) {
                var precedingMember = this.getMember(precedingPosition);
                if (precedingMember != null) {
                    precedingMember.showResizeBar = true;
                    this.reflow();
                }
            }
            var resizer = newMembers.shift();
            if (isResizerWidget) resizer.destroy();
        }

        newMembers = this._convertMembers(newMembers);
        return this.invokeSuper(isc.ToolStrip, "addMembers", newMembers,position,dontAnimate,d,e);
    },

    groupConstructor: "ToolStripGroup",
    addToolStripGroup : function (group, position) {
        if (!group) return null;

        if (!isc.isA.Class(group)) {
            var cons = this.groupConstructor;
            if (isc.isA.String(cons)) cons = isc.ClassFactory.getClass(this.groupConstructor);
            group = cons.create(group);
        }

        if (!group || !isc.isA.ToolStripGroup(group)) return null;

        // apply some overrides here
        if (group.showTitle == null) group.setShowTitle(this.showGroupTitle);
        if (!group.titleAlign) group.setTitleAlign(this.groupTitleAlign);
        if (!group.titleOrientation) group.setTitleOrientation(this.groupTitleOrientation);

        this.addMember(group, position);
        return group;
    },

    //> @method toolStrip.addFormItem()
    // Add a form item to this toolStrip. This method will create a DynamicForm autoChild with the
    // item passed in as a single item, based on the
    // +link{formWrapper,formWrapper config}, and add it to the toolstrip
    // as a member.
    // Returns a pointer to the generated formWrapper component.
    // @param formItem (FormItem Properties) properties for the form item to add to this
    //  toolStrip.
    // @param [formProperties] (DynamicForm Properties) properties to apply to the generated
    //  formWrapper component. If passed, specified properties will be overlaid onto the
    //  properties derived from +link{toolStrip.formWrapperDefaults} and
    //  +link{toolStrip.formWrapperProperties}.
    // @param [position] (integer) desired position for the form item in the tools
    // @return (DynamicForm) generated wrapper containing the form item.
    // @visibility external
    //<
    addFormItem : function (formItem, formProperties, position) {
        // Sanity check - if passed a canvas, add it and return.
        if (isc.isA.Canvas(formItem)) {
            this.addMember(formItem, position);
            return formItem;
        }

        var wrapper = this.createAutoChild("formWrapper", formProperties);
        wrapper.setItems([formItem]);
        this.addMember(wrapper, position);
        return wrapper;

    },

    //> @attr toolStrip.formWrapper (MultiAutoChild DynamicForm : null : IR)
    // DynamicForm instance created by +link{addFormItem()} to contain form items for
    // display in this toolStrip. Each time addFormItem() is run, a new formWrapper
    // autoChild will be created, picking up properties according to the standard
    // +link{type:AutoChild} pattern.
    // @visibility external
    //<

    //> @attr toolStrip.formWrapperConstructor (String : "DynamicForm" : IRA)
    // SmartClient class for generated +link{toolStrip.formWrapper} components.
    // @visibility external
    //<
    formWrapperConstructor:"DynamicForm",

    //> @attr toolStrip.formWrapperDefaults (Object : ... : IR)
    // Default properties to apply to +link{formWrapper} components. Default object
    // is as follows:
    // <pre>
    // { showTitle:false,
    //   numCols:1,
    //   overflow:"visible",
    //   width:1, height:1 }
    // </pre>
    // @visibility external
    //<
    formWrapperDefaults:{
        showTitle:false,
        numCols:1,
        overflow:"visible",
        width:1, height:1
    }

    //> @attr toolStrip.formWrapperProperties (Object : null : IR)
    // Properties to apply to +link{formWrapper} components.
    // @visibility external
    //<

});

//> @class ToolStripSeparator
// Simple subclass of Img with appearance appropriate for a ToolStrip separator
// @treeLocation Client Reference/Layout/ToolStrip
//
// @visibility external
//<
isc.defineClass("ToolStripSeparator", "Img").addProperties({
    //> @attr toolStripSeparator.skinImgDir (URL : "images/ToolStrip/" : IR)
    // Path to separator image.
    // @visibility external
    //<
    skinImgDir:"images/ToolStrip/",

    //> @attr toolStripSeparator.vSrc (SCImgURL : "[SKIN]separator.png" : IR)
    // Image for vertically oriented separator (for horizontal toolstrips).
    // @visibility external
    //<
    vSrc:"[SKIN]separator.png",

    //> @attr toolStripSeparator.hSrc (SCImgURL : "[SKIN]hseparator.png" : IR)
    // Image for horizontally oriented separator (for vertical toolstrips).
    // @visibility external
    //<
    hSrc:"[SKIN]hseparator.png",

    // NOTE: we keep the default imageType:"stretch", which looks fine for the default image,
    // which is just two vertical lines.

    // prevents misalignment if ToolStrip is stretched vertically by members
    layoutAlign:"center",

    initWidget : function () {
        // vertical switch of hSrc/vSrc is handled by StretchImg, but not by Img
        if (isc.isA.Img(this)) this.src = this.vertical ? this.vSrc : this.hSrc;

        this.Super("initWidget", arguments);
    }

});

//> @class ToolStripButton
// Simple subclass of StretchImgButton with appearance appropriate for a ToolStrip button.
// Can be used to create an icon-only button, and icon with text, or a text only button by setting the
// icon and title attibutes as required.
// @visibility external
// @treeLocation Client Reference/Layout/ToolStrip
//<
isc.defineClass("ToolStripButton", "StretchImgButton").addProperties({

    showTitle:true,
    showRollOver:true,
    showDown:true,


    labelHPad:6,
    labelVPad:0,
    autoFit:true,


    initWidget : function () {
        if (!this.title) this.iconSpacing = 0;
        this.Super("initWidget", arguments);
    },
    setTitle : function (newTitle) {
        if (!newTitle) {
            this.iconSpacing = 0;
            if (this.label) this.label.iconSpacing = 0;
        }
        this.Super("setTitle", arguments);
    },

    src:"[SKIN]/ToolStrip/button/button.png",
    capSize:3,
    height:22
});







//>    @class    ToolStripGroup
//
// A widget that groups other controls for use in +link{class:ToolStrip, tool-strips}.
//
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.defineClass("ToolStripGroup", "VLayout").addProperties({

    //> @attr toolStripGroup.styleName (CSSClassName : "toolStripGroup" : IRW)
    // CSS class applied to this ToolStripGroup.
    // @visibility external
    //<
    styleName: "toolStripGroup",

    layoutMargin: 2,
    membersMargin: 1,

    layoutAlign: "top",

    autoDraw: false,

    height: 1,
    width: 1,
    overflow: "visible",

    //> @attr toolStripGroup.controls (Array of Widget : null : IRW)
    // The array of controls to show in this group.
    // @visibility external
    //<

    //> @attr toolStripGroup.label (AutoChild HLayout : null : IR)
    // Label autoChild that presents the title for this ToolStripGroup.
    // This can be customized via the standard +link{type:AutoChild} pattern.
    // @visibility external
    //<

    labelLayoutDefaults: {
        _constructor: "HLayout",
        width: "100%",
        height: 22
    },

    //> @attr toolStripGroup.labelConstructor (String : "Label" : IRA)
    // SmartClient class for the title label.
    // @visibility external
    //<
    labelConstructor: "Label",

    labelDefaults: {
        width: "100%",
        height: 18,
        autoDraw: true,
        wrap: false,
        overflow: "visible"
    },

    //> @attr toolStripGroup.titleAlign (Alignment : "center" : IRW)
    // Controls the horizontal alignment of the group-title in its label.  Setting this
    // attribute overrides the default specified by
    // +link{toolStrip.groupTitleAlign, groupTitleAlign} on the containing
    // +link{class:ToolStrip, ToolStrip}.
    // @visibility external
    //<
    //titleAlign: "center",

    //> @attr toolStripGroup.titleStyle (CSSClassName : "toolStripGroupTitle" : IRW)
    // CSS class applied to this ToolStripGroup.
    // @visibility external
    //<
    titleStyle: "toolStripGroupTitle",


    //> @attr toolStripGroup.autoSizeToTitle (Boolean : true : IR)
    // By default, ToolStripGroups are assigned a minimum width that allows the entire title
    // to be visible.  To prevent this bahavior and have group-titles cut off when they're
    // wider than the buttons they contain, set this attribute to false
    // @visibility external
    //<
    autoSizeToTitle: true,

    //> @attr toolStripGroup.titleOrientation (VerticalAlignment : "top" : IRW)
    // Controls the horizontal alignment of the group-title in its label.  Setting this
    // attribute overrides the default specified by
    // +link{toolStrip.groupTitleAlign, groupTitleOrientation} on the containing
    // +link{class:ToolStrip, ToolStrip}.
    // @visibility external
    //<
    //titleOrientation: "top",

    //> @attr toolStripGroup.titleProperties (AutoChild Label : null : IRW)
    // AutoChild properties for fine customization of the title label.
    // @visibility external
    //<

    //> @attr toolStripGroup.body (AutoChild HLayout : null : IR)
    // HLayout autoChild that manages multiple VLayouts containing controls.
    // @visibility external
    //<

    //> @attr toolStripGroup.bodyConstructor (String : "HLayout" : IRA)
    // SmartClient class for the body.
    // @visibility external
    //<
    bodyConstructor:"HLayout",

    bodyDefaults: {
        width: 1,
        height: "*",
        overflow: "visible",
        membersMargin: 2,
        autoDraw: false
    },

    // some autochild defaults for the individual VLayouts that represent columns
    columnLayoutDefaults: {
        _constructor: "VLayout",
        width: 1,
        membersMargin: 2,
        height: "100%",
        overflow: "visible",
        autoDraw: false,
        numRows: 0,
        addMember : function (member, position) {
            this.Super("addMember", arguments);

            if (member.rowSpan == null) member.rowSpan = 1;
            var height = member.rowSpan * this.creator.rowHeight +
                ((member.rowSpan-1) * this.membersMargin);

            if (member.orientation == "vertical") {
                member.rowSpan = this.maxRows;
                height = (member.rowSpan * this.creator.rowHeight) +
                    ((this.maxRows-1) * this.membersMargin);
            }
            member.setHeight(height);
            this.numRows += member.rowSpan;
            if (this.numRows > this.maxRows) this.numRows = this.maxRows;
        },
        removeMember : function (member) {
            this.Super("removeMember", arguments);

            if (member.rowSpan == null) member.rowSpan = 1;
            this.numRows -= member.rowSpan;

            member.markForDestroy();
            member = null;
        }
    },

    //> @attr toolStripGroup.numRows (Number : 1 : IRW)
    // The number of rows of controls to display in each column.
    // @visibility external
    //<
    numRows: 1,

    //> @attr toolStripGroup.rowHeight (Number : 26 : IRW)
    // The height of rows in each column.
    // @visibility external
    //<
    rowHeight: 26,

    defaultColWidth: "*",

    //> @attr toolStripGroup.titleHeight (Number : 18 : IRW)
    // The height of the +link{toolStripGroup.label, title label} in this group.
    // @visibility external
    //<
    titleHeight: 18,

    initWidget : function () {
        this.Super("initWidget", arguments);

        var showLabel = this.showTitle != false && this.showLabel != false;

        if (showLabel) {
            this.addAutoChild("labelLayout", { height: this.titleHeight });

            var labelProps = isc.addProperties({}, this.titleProperties || {}, {
                styleName: this.titleStyle,
                height: this.titleHeight,
                maxHeight: this.titleHeight,
                align: this.titleAlign,
                contents: this.title,
                autoDraw: false
            });

            if (this.autoSizeToTitle == false) labelProps.overflow = "hidden";

            this.addAutoChild("label", labelProps);

            this.labelLayout.addMember(this.label);

            if (this.showTitle == false) this.labelLayout.hide();
            this.addMember(this.labelLayout);
        }

        this.addAutoChild("body", {
            _constructor: this.bodyConstructor,
            height: this.numRows * this.rowHeight,
            resized: function () {
                var newWidth = this.getVisibleWidth();
                if (this.parentElement.labelLayout) this.parentElement.labelLayout.setWidth(newWidth);
                if (this.parentElement.label) this.parentElement.label.setWidth(newWidth);
            }
        });

        this.addMember(this.body, showLabel ? (this.titleOrientation == "bottom" ? 0 : 1) : 0);

        if (this.controls) {
            this.addControls(this.controls, false);
        }

    },

    //> @method toolStripGroup.setTitle()
    // Sets the header-text for this group.
    //
    // @param title (String) The new title for this group
    // @visibility external
    //<
    setTitle : function (title) {
        if (this.label) this.label.setContents(title);
    },

    //> @method toolStripGroup.setShowTitle()
    // This method forcibly shows or hides this group's title after initial draw.
    //
    // @param showTitle (boolean) should be show the title be shown or hidden?
    // @visibility external
    //<
    setShowTitle : function (showTitle) {
        this.showTitle = showTitle;
        if (!showTitle && this.labelLayout && this.labelLayout.isVisible()) this.labelLayout.hide();
        else if (showTitle && this.labelLayout && !this.labelLayout.isVisible()) this.labelLayout.show();
    },

    //> @method toolStripGroup.setTitleAlign()
    // This method forcibly sets the text-alignment of this group's title after initial draw.
    //
    // @param align (Alignment) the new alignment for the text, left or right
    // @visibility external
    //<
    setTitleAlign : function (align) {
        this.titleAlign = align;
        if (this.label) this.label.setAlign(this.titleAlign);
    },

    //> @method toolStripGroup.setTitleOrientation()
    // This method forcibly sets the orientation of this group's title after initial draw.
    //
    // @param orientation (VerticalAlignment) the new orientation for the title, either bottom or top
    // @visibility external
    //<
    setTitleOrientation : function (orientation) {
        this.titleOrientation = orientation;
        if (this.label && this.labelLayout) {
            if (this.titleOrientation == "top") {
                this.removeMember(this.labelLayout);
                this.addMember(this.labelLayout, 0);
            } else if (this.titleOrientation == "bottom") {
                this.removeMember(this.labelLayout);
                this.addMember(this.labelLayout, 1);
            }
        }
    },

    addColumn : function (index, controls) {
        var undef;
        if (index === null || index === undef) {
            index = this.body.members.length;
        }

        var colWidth = this.defaultColWidth;
        if (this.colWidths && this.colWidths[index] != null) colWidth = this.colWidths[index];

        var newColumn = this.createAutoChild("columnLayout",
            { maxRows: this.numRows, numRows: 0, width: colWidth, height: this.body.getVisibleHeight()-1 }
        );
        this.body.addMember(newColumn, index);

        if (controls) newColumn.addMembers(controls);

        return newColumn;
    },

    getAvailableColumn : function (createIfUnavailable) {
        var members = this.body.members;

        if (members && members.length > 0) {
            for (var i=0; i<members.length; i++) {
                var member = members[i];
                //this.logWarn("member " + member + " numRows is " + member.numRows);
                if (member.numRows < member.maxRows) return member;
            }
        }

        if (createIfUnavailable != false) return this.addColumn();
        return null;
    },

    //> @method toolStripGroup.setControlColumn()
    // Return the column widget that contains the passed control.
    //
    // @param control (Canvas) the control to find in this group
    // @visibility external
    //<
    getControlColumn : function (control) {
        var members = this.body.members;

        if (members && members.length > 0) {
            for (var i=members.length-1; i>=0; i--) {
                if (members[i].members.contains(control)) return members[i];
            }
        }

        return null;
    },

    //> @method toolStripGroup.setControls()
    // Clears the array of controls and then adds the passed array to this toolStripGroup,
    // creating new columns as necessary according to each control's rowSpan attribute and
    // the group's +link{numRows} attribute.
    //
    // @param controls (Array of Canvas) an array of widgets to add to this group
    // @visibility external
    //<
    setControls : function (controls, store) {
        if (this.controls) {
            this.removeAllControls();
        }
        this.addControls(controls, store);
    },

    //> @method toolStripGroup.addControls()
    // Adds an array of controls to this group, creating new columns as necessary
    // according to each control's rowSpan attribute and the group's numRows attribute.
    //
    // @param controls (Array of Canvas) an array of widgets to add to this group
    // @visibility external
    //<
    addControls : function (controls, store) {
        if (!controls) return;
        if (!isc.isAn.Array(controls)) controls = [controls];

        for (var i=0; i<controls.length; i++) {
            this.addControl(controls[i], null, store);
        }
    },

    //> @method toolStripGroup.addControl()
    // Adds a control to this toolStripGroup, creating a new column if necessary,
    // according to the control's rowSpan attribute and the group's +link{numRows} attribute.
    //
    // @param control (Canvas) a widget to add to this group
    // @param [index] (Integer) optional insertion index for this control
    // @visibility external
    //<
    addControl : function (control, index, store) {
        if (!control) return null;

        var undef;
        if (index === null || index === undef || index >= this.numRows) index = this.numRows-1;

        var column = this.getAvailableColumn(true);

        if (!this.controls) this.controls = [];
        if (store != false) this.controls.add(control);

        column.addMember(control, index);
        column.reflowNow();
    },

    //> @method toolStripGroup.removeControl()
    // Removes a control from this toolStripGroup, destroying an existing column if this is the
    // last widget in that column.
    //
    // @param control (Canvas) a widget to remove from this group
    // @visibility external
    //<
    autoHideOnLastRemove: false,
    removeControl : function (control) {
        control = isc.isAn.Object(control) ? control : this.getMember(control);
        if (!control) return null;

        var column = this.getControlColumn(control);

        if (column) {
            column.removeMember(control);
            this.controls.remove(control);
            if (column.members.length <= 1) {
                // if the column is now empty, destroy it
                column.hide();
                this.body.removeMember(column);
                column.markForDestroy();
                column = null;
            }
        }

        if (this.body.members.length == 0 && this.autoHideOnLastRemove) {
            // hide ourselves
            this.hide();
        }
    },

    removeAllControls : function () {
        if (!this.controls || this.controls.length == 0) return null;

        for (var i=this.controls.length-1; i>=0; i--) {
            var control = this.controls[i];
            control.hide();
            this.removeControl(control);
            control.markForDestroy();
            control = null;
        }
    },

    resized : function () {
        this._updateLabel();
    },

    draw : function () {
        this.Super("draw", arguments);

        this._updateLabel();
    },

    redraw : function () {
        this.Super("redraw", arguments);

        this._updateLabel();
    },

    _updateLabel : function () {
        var visibleWidth = this.getVisibleWidth(),
            margin = this.layoutMargin,
            newWidth = this.getVisibleWidth() - (this.layoutMargin*3)
        ;

        if (this.labelLayout) this.labelLayout.setWidth(newWidth);
        if (this.label) this.label.setWidth(newWidth);
    }

});


//>    @class    IconButton
// A Button subclass that displays an icon, title and optional menuIcon and is capable of
// horizontal and vertical orientation.
//
// @visibility external
//<
isc.defineClass("IconButton", "Button").addProperties({

width: 1,
overflow: "visible",
height: 1,

padding: 3,

autoDraw: false,

usePartEvents: true,

//> @attr iconButton.orientation (String : "horizontal" : IRW)
// The orientation of this IconButton.  The default value, "horizontal", renders icon, title
// and potentially menuIcon from left to right: "vertical" does the same from top to bottom.
//
// @visibility external
//<
orientation: "horizontal",

//> @attr iconButton.rowSpan (Number : 1 : IRW)
// When used in a +link{class:RibbonBar}, the number of rows this button should consume.
//
// @visibility external
//<
rowSpan: 1,

//> @attr iconButton.baseStyle (CSSClassName : "iconButton" : IRW)
// Default CSS class.
//
// @visibility external
//<
baseStyle: "iconButton",

//> @attr iconButton.showMenuIcon (Boolean : false : IRW)
// Whether to show the +link{menuIconSrc, menu-icon} which fires the +link{menuIconClick}
// notification method when clicked.
//
// @visibility external
//<
showMenuIcon: false,

//> @attr iconButton.menuIconSrc (SCImgURL : "[SKINIMG]/Menu/submenu_down.png" : IRW)
// Base URL for an Image that shows a +link{class:Menu, menu} when clicked.  See also
// +link{iconButton.showMenuIconDisabled} and +link{iconButton.showMenuIconOver}.
//
// @visibility external
//<
menuIconSrc: "[SKINIMG]/Menu/submenu_down.png",

menuIconWidth: 14,
menuIconHeight: 13,
menuIconStyleCSS: "vertical-align:middle; border:1px solid transparent; -moz-border-radius: 3px; " +
    "-webkit-border-radius: 3px; -khtml-border-radius: 3px; border-radius: 3px;"
,

menuConstructor: isc.Menu,

//> @attr iconButton.iconOrientation (String : null : IRW)
// This attribute is not supported in this subclass.  However, RTL mode is still supported.
//
// @visibility external
//<

//> @attr iconButton.iconAlign (String : null : IRW)
// This attribute is not supported in this subclass.  However, RTL mode is still supported.
//
// @visibility external
//<

//> @attr iconButton.align (Alignment : null : IRW)
// Horizontal alignment of this button's content.  If unset,
// +link{iconButton.orientation, vertical buttons} are center-aligned and horizontal
// buttons left-aligned by default.
// @group appearance
// @visibility external
//<
align: null,

//> @attr iconButton.valign (VerticalAlignment : null : IRW)
// Vertical alignment of this button's content.  If unset,
// +link{iconButton.orientation, vertical buttons} are top-aligned and horizontal
// buttons center-aligned by default.
// @group appearance
// @visibility external
//<
valign: null,

initWidget : function () {
    if (this.orientation == "vertical") {
        this.align = this.align || "center";
        this.valign = this.valign || "top";
    } else {
        this.align = this.align || "left";
        this.valign = this.valign || "center";
    }

    this._originalAlign = this.align;
    this._originalVAlign = this.valign;

    this._originalTitle = this.title;
    this._originalIcon = this.icon;

    this.Super("initWidget", arguments);

},

//> @attr iconButton.showTitle (Boolean : null : IRW)
// showTitle is not applicable to this class - use +link{iconButton.showButtonTitle}
// instead.
//
// @visibility external
//<

//> @attr iconButton.showButtonTitle (Boolean : true : IRW)
// Whether to show the title-text for this IconButton.  If set to false, title-text is omitted
// altogether and just the icon is displayed.
//
// @visibility external
//<
showButtonTitle: true,


//> @attr iconButton.showIcon (Boolean : null : IRW)
// Whether to show an Icon in this IconButton.  Set to false to render a text-only button.
//
// @visibility external
//<

//> @attr iconButton.icon (SCImgURL : null : IRW)
// Icon to show to the left of or above the title, according to the button's +link{orientation}.
// <P>
// When specifying <code>titleOrientation = "vertical"</code>, this icon will be stretched to
// the +link{largeIconSize} unless a +link{largeIcon} is specified.
//
// @visibility external
//<

//> @attr iconButton.iconSize (Number : 16 : IRW)
// The size of the normal icon for this button.
//
// @visibility external
//<
iconSize: 16,

//> @method iconButton.setIcon()
// Sets a new Icon for this button after initialization.
//
// @visibility external
//<
setIcon : function (icon) {
    // we don't use the regular "icon", but instead we build it into the "title" - store the
    // new icon appropriately and rebuild the title to incorporate the new icon.
    this._originalIcon = icon;
    this.setTitle(this._originalTitle);
},

//> @attr iconButton.largeIcon (SCImgURL : null : IRW)
// Icon to show above the title when +link{orientation} is "vertical".
// <P>
// If a largeIcon is not specified, the +link{icon, normal icon} will be stretched to
// the +link{largeIconSize}.
//
// @visibility external
//<

//> @method iconButton.setLargeIcon()
// Sets a new Large-Icon for vertical buttons after initialization - synonymous with
// +link{iconButton.setIcon, setIcon} for normal horizontal buttons.
//
// @visibility external
//<
setLargeIcon : function (icon) {
    // set the largeIcon and rebuild the title to incorporate it.
    this.largeIcon = icon;
    this.setTitle(this._originalTitle);
},

//> @attr iconButton.largeIconSize (Number : 32 : IRW)
// The size of the large icon for this button.  If +link{largeIcon} is not specified, the
// +link{icon, normal icon} will be stretched to this size.
//
// @visibility external
//<
largeIconSize: 32,

setTitle : function (title) {
    this._originalTitle = title;
    this.Super("setTitle", arguments);
    this.getTitle();
    this.align = this._originalAlign;
    this.valign = this._originalVAlign;
    this.redraw();
},

getTitle : function () {

    var isLarge = this.orientation == "vertical",
        icon = this.showIcon == false ? null :
            (isLarge ? this.largeIcon || this._originalIcon : this._originalIcon),
        iconSize = (isLarge ? this.largeIconSize : this.iconSize),
        title = this.showButtonTitle ? this._originalTitle : ""
    ;

    if (icon == "") icon = null;

    if (icon && this.showDisabledIcon && this.isDisabled()) {
        var dotIndex = icon.lastIndexOf("."),
            tempIcon = dotIndex > 0 ?
                        icon.substring(0, dotIndex) + "_Disabled" + icon.substring(dotIndex) :
                        icon + "_Disabled"
        ;

        icon = tempIcon;
    }

    var iconCSS = "vertical-align:middle;" + (isLarge ? "margin-bottom:5px;" : ""),
        menuIconCSS = this.menuIconStyleCSS + (isLarge ? "margin-top:4px;" : ""),
        img = icon ? this.imgHTML(icon, iconSize, iconSize, null,
            " style='" + iconCSS + "' eventpart='icon'") : null
    ;

    var menuIcon = null;
    if (this.showMenuIcon) {
        var menuIconUrl = this._getMenuIconURL();

        menuIcon = this.menuIcon = this.showMenuIcon ?
            this.imgHTML(menuIconUrl, this.menuIconWidth, this.menuIconHeight, "menuIcon",
                " style='" + menuIconCSS + "' eventpart='menuIcon' " ) : null;
        ;
    }

    this.icon = null;

    var tempTitle = title,
        title = img || ""
    ;

    if (this.orientation == "vertical") {
        if (this.showButtonTitle) title += "<br>" + tempTitle;
        if (this.showMenuIcon && menuIcon) title += "<br>" + menuIcon;
    } else {
        this.valign = "center";
        if (this.showButtonTitle)
            title += "&nbsp;<span style='vertical-align:middle'>" + tempTitle + "</span>";
        if (this.showMenuIcon && menuIcon) title += "&nbsp;" + menuIcon;
    }

    this.title = title;
    return title;
},

_getMenuIconURL : function () {
    var state = this.state,
        selected = this.selected,
        customState = this.getCustomState(),
        sc = isc.StatefulCanvas
    ;

    //this.logWarn(isc.echoFull("state is " + state));

    // ignore states we don't care about
    if (state == sc.STATE_DISABLED && !this.showMenuIconDisabled) state = null;
    else if (state == sc.STATE_OVER && (!this.showMenuIconOver || !this.showingMenuButtonOver))
        state = null;

    var focused = null; //this.showFocusedMenuIcon ? this.getFocusedState() : null;
    var icon = this.menuIconSrc;
    return isc.Img.urlForState(icon, selected, focused, state, null, customState);
},

setHandleDisabled : function () {
    this.Super("setHandleDisabled", arguments);
    this.setTitle(this._originalTitle);
},

setDisabled : function (disabled) {
    // when we change disabled-status, rebuild the title and redraw
    this.Super("setDisabled", arguments);
    this.setTitle(this._originalTitle);
},

mouseOut : function () {
    this.Super("mouseOut", arguments);

    if (this.showingMenuButtonOver) this.menuIconMouseOut();
},

//> @method iconButton.menuIconClick()
// Notification method fired when a user clicks on the menuIcon on this IconButton.  Return
// false to suppress the standard click handling code.
//
// @return (Boolean) return false to cancel event-bubbling
// @visibility external
//<
menuIconClick : function () { return true; },

//> @attr iconButton.showMenuIconOver (Boolean : true : IRW)
// Whether to show an Over version of the +link{menuIcon}.
//
// @visibility external
//<
showMenuIconOver: true,

//> @attr iconButton.showMenuIconDisabled (Boolean : true : IRW)
// Whether to show a Disabled version of the +link{menuIcon}.
//
// @visibility external
//<
showMenuIconDisabled: true,

menuIconMouseMove : function () {
    if (!this.showMenuIconOver || this.showingMenuButtonOver) return;

    var element = this.getImage("menuIcon");

    if (element) {
        this.showingMenuButtonOver = true;
        this.setTitle(this._originalTitle);
        //element.style.border = this.menuIconOverBorderCSS;
    }
},

menuIconMouseOut : function () {
    if (!this.showMenuIconOver) return;

    var element = this.getImage("menuIcon");

    if (element) {
        this.showingMenuButtonOver = false;
        this.setTitle(this._originalTitle);
        //element.style.border = "1px solid transparent";
    }
}


});

//>    @class    IconMenuButton
// A subclass of +link{IconButton} that shows a menuIcon by default and implements showMenu().
// <P>
// This class has +link{iconButton.showMenuIcon,showMenuIcon} set to <code>true</code> by default,
// and has a +link{iconButton.menuIconClick} handler which will show the specified
// +link{iconMenuButton.menu} via a call to +link{iconMenuButton.showMenu()}.
// This menuIconClick handler cancels default click behavior, so, if a user clicks the menu
// item, any specified +link{canvas.click,click handler} for the button as a whole will not fire.
//
// @visibility external
//<
isc.defineClass("IconMenuButton", "IconButton").addProperties({

usePartEvents: true,

showMenuIcon: true,

menuIconClick : function () {
    this.showMenu();
    return false;
},

//>    @attr iconMenuButton.menu (Menu : null : IRW)
// The menu to show when the +link{this.menuIconSrc, menu-icon} is clicked.
// <P>
// For a menu button with no menu (menu: null) the up/down arrow image can
// be suppressed by setting
// +link{menuButton.showMenuButtonImage, showMenuButtonImage}: <code>false</code>.
//
// @visibility external
//<
menu:null,

//> @attr iconMenuButton.menuAnimationEffect (string : null : IRWA)
// Allows you to specify an animation effect to apply to the menu when it is being shown.
// Valid options are "none" (no animation), "fade", "slide" and "wipe".
// If unspecified falls through to <code>menu.showAnimationEffect</code>
// @visibility animation
//<

//> @method iconMenuButton.showMenu()
// Shows this button's +link{iconMenuButton.menu}.  Called automatically when a user clicks the
// +link{menuIconSrc, menuIcon}.
//
// @return (Boolean) true if a menu was shown
// @visibility external
//<
showMenu : function () {
    // lazily create the menu if necessary, so we can init with, or set menu to, an object
    // properties block
    if (isc.isA.String(this.menu)) this.menu = window[this.menu];
    if (!isc.isA.Menu(this.menu)) this._createMenu(this.menu);
    if (!isc.isA.Menu(this.menu)) return false;

    var menu = this.menu;

    // draw offscreen so that we can figure out what size the menu is
    // Note that we use _showOffscreen which handles figuring out the size, and
    // applying scrollbars if necessary.
    menu._showOffscreen();

    // figure out the left coordinate of the drop-down menu
    var left = this.getPageLeft();

    //left = left - (menu.getVisibleWidth() - this.getVisibleWidth());

    var top = this.getPageTop()+this.getVisibleHeight()+1;

    // don't allow the menu to show up off-screen
    menu.placeNear(left, top);
    menu.show(this.menuAnimationEffect);

    return true;
},

_createMenu : function (menu) {
    if (!menu) return;
    menu.autoDraw = false;

    var cons = this.menuConstructor || isc.Menu;
    this.menu = cons.create(menu);
}


});


//> @class RibbonBar
//
// A +link{class:ToolStrip, ToolStrip-based} class for showing
// +link{class:RibbonGroup, groups} of related buttons and other controls.
//
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.defineClass("RibbonBar", "ToolStrip").addProperties({

    groupConstructor: "RibbonGroup",

    //> @method ribbonBar.addGroup()
    // Add a new group to this RibbonBar. You can either create your group externally and pass
    // it in, or you can pass a properties block from which to automatically construct it.
    //
    // @param group (RibbonGroup) the new group to add to this ribbon
    // @param [position] (Integer) the index at which to insert the new group
    // @visibility external
    //<
    addGroup : function (group, position) {
        return this.addToolStripGroup(group, position);
    }

});
//> @class RibbonGroup
//
// A widget that groups other controls for use in +link{class:RibbonBar, RibbonBars}.
//
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.defineClass("RibbonGroup", "ToolStripGroup").addProperties({

    //> @attr ribbonGroup.newControlConstructor (Class : "IconButton" : IR)
    // Widget class for controls +link{createControl, created automatically} by this
    // RibbonGroup.  Since +link{newControl, such controls} are created via the autoChild
    // system, they can be further customized via the newControlProperties property.
    //
    // @visibility external
    //<
    newControlConstructor: "IconButton",
    //> @attr ribbonGroup.newControlDefaults (MultiAutoChild IconButton : null : IR)
    // Properties used by +link{createControl} when creating new controls.
    //
    // @visibility external
    //<
    newControlDefaults: {
    },

    //> @method ribbonGroup.createControl()
    // Add a new control to this RibbonBar.  The control is created using the autoChild system,
    // according to the +link{newControlConstructor, new control} You can either create your group and pass it in the
    // first parameter, or you can pass a properties clock from which to automatically
    // construct it.
    //
    // @param properties (Canvas Properties) properties from which to construct a new control
    // @param [position] (Integer) the index at which to insert the new control
    //
    // @visibility external
    //<
    createControl : function (properties, position) {
        var newControl = this.createAutoChild("newControl", properties);

        return this.addControl(newControl, position);
    }

});







//> @class SectionStack
// A container that manages a list of sections of widgets, each with a header.  Sometimes called
// an "Accordion".
// <P>
// SectionStack can be configured so that only one section is visible at a time (similar to MS Outlook's
// left-hand Nav), or to allow multiple sections to be visible and share the available space.
//
// @treeLocation Client Reference/Layout
// @visibility external
// @example sectionsExpandCollapse
//<
isc.defineClass("SectionStack", "VLayout");

//>!BackCompat 2005.6.15 old name: "ListBar"
isc.addGlobal("ListBar", isc.SectionStack);
//<!BackCompat

isc.SectionStack.addProperties({
    //> @attr sectionStack.overflow (Overflow : "hidden" : IR)
    // Normal +link{type:Overflow} settings can be used on layouts, for example, an
    // overflow:auto Layout will scroll if sections are resized to exceed the specified size,
    // whereas an overflow:visible Layout will grow to accommodate the resized sections.
    // @visibility external
    //<
    overflow:"hidden",

    //> @attr sectionStack.styleName (CSSStyleName : "sectionStack" : IR)
    // Default CSS style for the SectionStack as a whole.
    // @visibility external
    //<
    styleName:"sectionStack",

    // Section Header Creation
    // ---------------------------------------------------------------------------------------

    //> @attr sectionStack.sectionHeaderClass (Classname : "SectionHeader" : IRA)
    // <var class="smartgwt">
    // Name of a SmartClient class to use for creating section headers.  This will default to either
    // +link{SectionHeader,"SectionHeader"} or +link{ImgSectionHeader,"ImgSectionHeader"} depending on
    // the skin.  You can use the &#83;martClient class system to create a simple SmartClient subclass of
    // either SectionHeader or ImgSectionHeader for use with this API - see the
    // +link{group:skinning,Skinning Guide} for details.
    // </var>
    // <var class="smartclient">
    // Name of the Canvas subclass to use as a header that labels the section and allows
    // showing and hiding.  The default class can be skinned, or trivial subclasses created to
    // allow different appearances for headers in different SectionStacks.
    // <P>
    // Very advanced developers can use the following information to create custom header
    // classes.
    // <P>
    // The SectionStack will instantiate this class, giving the following properties on init:
    // <ul>
    // <li><code>layout</code>: the SectionStack
    // <li><code>expanded</code>: true or false
    // <li><code>hidden</code>: true or false
    // <li><code>title</code>: section title
    // </ul>
    // From then on, when the sectionHeader is clicked on, it should call
    // +link{method:SectionStack.sectionHeaderClick()}.
    // <P>
    // Whenever the section is hidden or shown, sectionHeader.setExpanded(true|false) will be
    // called if implemented.
    // </var>
    //
    // @visibility external
    //<
    sectionHeaderClass:"SectionHeader",

    //> @attr sectionStack.headerHeight (Number : 20 : IR)
    // Height of headers for sections.
    // @visibility external
    //<
    headerHeight:20,

    // sectionStack header styles for printing
    printHeaderStyleName:"printHeader",


    // All Sections
    // ---------------------------------------------------------------------------------------

    //> @attr SectionStack.sections (Array of SectionStackSection Properties : null : [IR])
    // List of sections of components managed by this SectionStack.
    //
    // @see sectionStack.getSections()
    // @visibility external
    // @example sectionsExpandCollapse
    //<

    //> @attr SectionStack.canResizeSections (Boolean : true : [IRA])
    // Whether sections can be drag resized by the user dragging the section header.
    // <P>
    // Note that, with <code>canResizeSections:true</code>, not all sections can be resized:
    // sections that contain only +link{Button.autoFit,autofitting} components or that are
    // marked with +link{SectionStackSection.resizeable,section.resizeable:false} will not be
    // resizeable.
    //
    // @visibility external
    //<
    canResizeSections:true,

    //> @attr sectionStack.canDropComponents (Boolean : true : IRA)
    // SectionStacks provide the same default implementation of drag and drop interactions as
    // +link{layout.canDropComponents, Layouts}, except that members are added as items into
    // the section over which they're dropped.
    // <P>
    // If you want to completely suppress the builtin drag and drop logic, but still receive drag
    // and drop events for your own custom implementation, set +link{Canvas.canAcceptDrop} to
    // <code>true</code> and <code>canDropComponents</code> to <code>false</code> on your
    // SectionStack.
    //
    // @group dragdrop
    // @visibility external
    //<

    // whether to allow the user to change the overall size of the SectionStack by resizing
    // sections

    canResizeStack:true,

    //> @attr SectionStack.canReorderSections (Boolean : false : [IRA])
    // Whether sections can be drag reordered by the user dragging the section header.
    // <P>
    // Note that, with <code>canReorderSections:true</code>, sections with
    // +link{SectionStackSection.canReorder,section.canReorder:false} will not be
    // able to be drag-reordered (though their index may still be changed by dropping other
    // sections above or below them in the section stack).
    //
    // @visibility external
    //<
    canReorderSections:false,

    //> @attr SectionStack.canTabToHeaders (boolean : null : [IRA])
    // If true, the headers for the sections (if shown) will be included in the page's tab
    // order for accessibility.
    // May be overridden at the Section level via +link{SectionStackSection.canTabToHeader}
    // <P>
    // If unset, section headers will be focusable if +link{isc.setScreenReaderMode} has been called.
    // See +link{group:accessibility}.
    // @visibility external
    //<

    //> @attr SectionStack.scrollSectionIntoView (Boolean : true : [IR])
    // If an expanded or shown section expands past the current viewport and this property is
    // true, then the viewport will auto-scroll to fit as much of the section content into the
    // viewport without scrolling the top of the section out of the viewport.
    //
    // @visibility external
    //<
    scrollSectionIntoView: true,

    // NOTE: vertical:false (horizontal stacks) does work, however the default SectionHeader
    // class has a height of 20 which needs to be wiped to allow vertical stretching.  And, you
    // have to have a strategy for vertical text labels.
    //     isc.defineClass("MyHeader", "SectionHeader").addProperties({height:null});
    //     isc.SectionStack.create({
    //         vertical:false,
    //         sectionHeaderClass:"MyHeader",
    //vertical:true,

    // Section Header Properties
    // ---------------------------------------------------------------------------------------

    //> @object SectionStackSection
    // Section descriptor used by a SectionStack to describe a section of items which are shown
    // or hidden together along with their associated header.
    // <P>
    // A section header (see +link{sectionStack.sectionHeaderClass}) is created from this descriptor when
    // the SectionStack is drawn. Any changes after creation  must be made to the section header:
    // +link{sectionStack.getSectionHeader}.
    // <P>
    // Additional SectionHeader properties set on the SectionStackSection not explicitly documented such as
    // "iconAlign" or "prompt" is supported<var class="smartgwt"> - use
    // <code>setAttribute()</code></var>.
    //
    // @treeLocation Client Reference/Layout/SectionStack
    // @visibility external
    //<

    //> @attr SectionStackSection.name (String : null : [IR])
    // Identifier for the section.  This can be used later in calls to +link{SectionStack} APIs such as
    // +link{sectionStack.expandSection} and +link{sectionStack.collapseSection}. Note that if no name
    // is specified for the section, one will be auto-generated when the section is created.
    // This property should be a string which may be used as a valid JavaScript identifier
    // (should start with a letter and not contain space or special characters such as "*").
    // @visibility external
    //<

    //> @attr SectionStackSection.ID (String : null : [IR])
    // Optional ID for the section. If +link{SectionStack.useGlobalSectionIDs} is true, this property will
    // be applied to the generated SectionStackHeader widget as a standard widget ID, meaning
    // it should be unique within a page.
    // <P>
    // <b>Backcompat Note</b>: Section stack sections may be uniquely identified within a stack
    // via the +link{SectionStackSection.name} attribute (introduced in Jan 2010). Prior to this,
    // the section ID attribute was used in this way (and would not be applied to the section header
    // as a widget ID). For backwards compatibility this is still supported: If
    // <code>section.name</code> is unspecified for a section but <code>section.ID</code> is set,
    // the ID will be used as a default name attribute for the section. For backwards compatibility
    // we also disable the standard behavior of having the <code>section.ID</code> being applied to the generated
    // section header (thereby avoiding the page-level uniqueness requirement) by defaulting
    // +link{SectionStackSection.useGlobalSectionIDs} to false.
    //
    // @visibility external
    //<

    //> @attr SectionStack.useGlobalSectionIDs (Boolean : false : [IR])
    // Should any specified +link{SectionStackSection.ID} be applied to the generated SectionHeader widget
    // for the section as a widget ID? If set to false, SectionStackSection.ID will behave as a synonym for
    // SectionStackSection.name.
    //
    // @visibility external
    //<
    // Default to false for back-compat
    useGlobalSectionIDs:false,

    //> @attr SectionStackSection.title (String : null : [IR])
    // Title to show for the section
    // @visibility external
    //<
    //> @attr sectionStackSection.clipTitle
    // @include sectionHeader.clipTitle
    // @visibility external
    //<
    //> @attr sectionStackSection.showClippedTitleOnHover
    // @include sectionHeader.showClippedTitleOnHover
    // @visibility external
    //<

    //> @attr SectionStackSection.items (Array of Canvas : null : [I])
    // List of Canvases that constitute the section.  These Canvases will be shown and hidden
    // together.
    // @visibility external
    //<

    //> @attr SectionStackSection.showHeader (Boolean : true : [I])
    // If true, a header will be shown for this section.  If false, no header will be shown.
    // @visibility external
    //<

    //> @attr sectionStackSection.canTabToHeader (boolean : null : IR)
    // If true, the header for this Section will be included in the page's tab
    // order for accessibility. May also be set at the +link{SectionStack} level via
    // +link{SectionStack.canTabToHeaders}.
    // <P>
    // See +link{group:accessibility}.
    //
    // @visibility external
    //<

    //> @attr sectionStackSection.icon   (SCImgURL : "[SKIN]SectionHeader/opener.gif" : [IR])
    // Base filename of the icon that represents open and closed states. The default settings
    // also change the icon for disabled sections, so a total of four images are required
    // (opened, closed, Disabled_opened, Disabled_closed).
    // <P>
    // Not shown if +link{sectionStackSection.canCollapse} is false.
    //
    // @visibility external
    //<


    //> @attr SectionStackSection.resizeable (boolean : null : [I])
    // If set to false, then the items in this section will not be resized by sectionHeader
    // repositioning.  You may also set this flag directly on any of the items in any section to
    // cause that item to not be resizeable.
    // @visibility external
    // @example resizeSections
    //<

    //> @attr SectionStackSection.canReorder (boolean : null : [I])
    // If set to false, then this sectionHeader will not be able to be dragged to perform a drag
    // reorder, if +link{SectionStack.canReorderSections} is true.
    // You can also disable dropping other sections before this one by setting
    // +link{canvas.canDropBefore,canDropBefore} to false.
    // @visibility external
    //<

    //> @attr SectionStackSection.canDropBefore (boolean : null : [I])
    // @include Canvas.canDropBefore
    // @visibility external
    //<

    //> @attr SectionStackSection.expanded (boolean : false : [I])
    // Sections default to the collapsed state unless +link{SectionStackSection.showHeader} is
    // set to <code>false</code> in which case they default to the expanded state.  This
    // attribute allows you to explicitly control the expand/collapse state of the
    // section by overriding the above default behavior.
    // @visibility external
    //<

    //> @attr SectionStackSection.hidden (boolean : false : [I])
    // Sections default to the visible state.  This
    // attribute allows you to explicitly control the visible/hidden state of the
    // section by overriding the above default behavior.
    // @visibility external
    //<

    //> @attr SectionStackSection.canCollapse (Boolean : true : [I])
    // This attribute controls whether or not the expand/collapse UI control is shown on the
    // header of this section.  Any section can still be expanded/collapsed programmatically,
    // regardless of this setting.
    // @visibility external
    // @example sectionsExpandCollapse
    //<

    //>Animation
    // ---------------------------------------------------------------------------------------
    //> @attr sectionStack.animateSections (boolean : null : IRW)
    // If true, sections are animated during expand/collapse and addition/removal of
    // SectionItems is likewise animated.
    // @group animation
    // @visibility animation
    // @example animateSections
    //<

    // change layout default effect for showing/hiding members; "slide" is appropriate for
    // eg Window minimize, but "wipe" is usually the best effect for SectionStacks
    animateMemberEffect:"wipe",
    //<Animation

    // Visibility of Sections
    // ---------------------------------------------------------------------------------------

    //> @type VisibilityMode
    // Settings for whether multiple sections can be in the expanded state simultaneously.
    //
    // @value "mutex"
    // Only one section can be expanded at a time.
    //
    // @value "multiple"
    // Multiple sections can be expanded at the same time, and will share space.
    //
    // @visibility external
    //<

    //> @attr SectionStack.visibilityMode (VisibilityMode : "mutex" : [IRW])
    // Whether multiple sections can be visible at once
    //
    // @see type:VisibilityMode
    // @visibility external
    // @example sectionsExpandCollapse
    //<
    visibilityMode:"mutex",

    //> @attr SectionStack.canCollapseAll (Boolean : true : [IRW])
    // In +link{sectionStack.visibilityMode} "mutex", whether to allow the last
    // remaining expanded section to be collapsed.  If false, collapsing the
    // last open section will open the next one (wrapping around at the end).
    // @visibility external
    //<
    canCollapseAll: true,

    // internal flag: if true, section stack will null out _userHeight on an eligible item when
    // hiding/collapsing sections to maintain the overall height of the SectionStack.  If
    // false, the SectionStack will grow/shrink instead.  This needs to be rolled up to Layout
    // as a policy instead.
    forceFill: true,

    //> @attr sectionStack.itemIndent (Number : 0 : [IRW])
    // Size, in pixels, of indentation of all member items. Items will be offset
    // and reduced in width by this amount. Overridden by
    // +link{itemStartIndent} or +link{itemEndIndent}.
    // Setting itemIndent is equivalent to setting itemStartIndent to the same amount
    // and itemEndIndent to 0.
    // @visibility external
    // @group layoutMember
    //<
    itemIndent: 0,

    //> @attr sectionStack.itemStartIndent (Number : undefined : [IRW])
    // Size, in pixels, of indentation of all member items relative to the start of
    // the alignment axis. For instance, for left-aligned members,
    // itemStartIndent specifies indentation for every item from the left side of the
    // section stack. Overrides +link{itemIndent}.
    // @visibility external
    // @group layoutMember
    //<

    //> @attr sectionStack.itemEndIndent (Number : undefined : [IRW])
    // Size, in pixels, of indentation of all member items relative to the end of
    // the alignment axis. For instance, for left-aligned members,
    // itemStartIndent specifies indentation for every item from the right side of the
    // section stack.
    // @visibility external
    // @group layoutMember
    //<

    //> @attr sectionStack.showExpandControls (Boolean : true : [IRW])
    // Whether to show the Expand/Collapse controls in the headers of sections.  If false, hides
    // the expand/collapse controls and, instead, treats a click anywhere on the header as if
    // it were a click on the expand control.
    // @visibility external
    //<
    showExpandControls: true
});

isc.SectionStack.addMethods({

    initWidget : function () {
        this.Super(this._$initWidget);

        if (this.canReorderSections) this.canAcceptDrop = true;

        //>Animation
        if (this.animateSections != null) this.animateMembers = this.animateSections;
        //<Animation

        //>!BackCompat 2005.6.15 old name: "ListBar" with "groups"
        if (this.groups != null && this.sections == null) this.sections = this.groups;
        //<!BackCompat

        var initSections = this.sections;
        this.sections = [];
        this.addSections(initSections, null, true);

    },

    _doPopOutDragMember : function (placeHolder, member) {
        var section = this.sectionForItem(member);

        if (section) {
            var index = this.getMemberNumber(member)-(this.getMemberNumber(section)+1);
            //this.logWarn("member index " + this.getMemberNumber(member) + "\n" +
            //    "header index " + this.getMemberNumber(section) + "\n" +
            //    "offset into section " + index
            //);
            this.addItem(section, placeHolder, index);
        } else {
            this.addMember(placeHolder, this.getMemberNumber(member), true);
        }
    },

    // replace one member with another, without an intervening relayout, and without animation
    replaceMember : function (oldMember, newMember) {

        var oldMemberPos = this.getMemberNumber(oldMember),
            section = this.sectionForItem(oldMember)
        ;

        if (!section) {
            return this.Super("replaceMember", arguments);
        }

        var oldSetting = this.instantRelayout;
        this.instantRelayout = false;

        this._finishDropAnimation();

        var sectionIndex = this.getMemberNumber(section);
        this.removeItem(section, oldMember);

        this.addItem(section, newMember, (oldMemberPos-sectionIndex)-1);

        this.instantRelayout = oldSetting;
        if (oldSetting) this.reflowNow();

    },

    _dragIsSectionReorder : function () {
        if (this.canReorderSections) {
            var target = this.ns.EH.dragTarget;
            return (this.sections != null && this.sections.contains(target));
        }
        return false;
    },

    willAcceptDrop : function () {
        if (this._dragIsSectionReorder()) {
            var target = this.ns.EH.dragTarget;
            return (target.canReorder != false);
        }
        // otherwise allow default implementation to continue - may allow some more
        // elaborate, unrelated customization
        return this.Super("willAcceptDrop", arguments);
    },

    getStackDropPosition : function () {
        var coord = this.vertical ? this.getOffsetY() : this.getOffsetX();

        // before beginning
        if (coord < 0) return 0;

        var totalSize = this.vertical ? this._topMargin : this._leftMargin,
            visibleMemberCount = 0
        ;

        for (var i = 0; i < this.members.length; i++) {
            var member = this.members[i];
            if (!member) continue;

            var section = member.isSectionHeader ? member : this.sectionForItem(member),
                sectionIsExpanded = this.sectionIsExpanded(section),
                memberIsVisible = member.isVisible() && sectionIsExpanded
            ;

            if (memberIsVisible || (member == section)) {
                if (coord < (totalSize + (size/2))) {
                    // respect an explicit canDropBefore setting, which prevents dropping before a
                    // member
                    if (member.canDropBefore === false) return false;
                    return i;
                }

                var size = this.memberSizes[visibleMemberCount];
                totalSize += size + this.membersMargin + this.getMemberGap(member);
                visibleMemberCount++;
            }
        }
        // last position: past halfway mark on last member
        return this.members.length;
    },

    getDropPosition : function (dropType, visibleOnly) {
        //>EditMode
        if (!this._dragIsSectionReorder()) {
            if (this.editingOn) {
                return this.getEditModeDropPosition(dropType);
            } else {
                return this.getStackDropPosition();
            }
        }
        //<EditMode

        var coord = this.vertical ? this.getOffsetY() : this.getOffsetX();
        // before beginning
        if (coord < 0) return 0;

        var totalSize = this.vertical ? this._topMargin : this._leftMargin,
            section = this.sections[0],
            sectionIndex = 0,
            // Note: hidden members have no entries in the this.memberSizes array so we need
            // to track both visible and hidden members as we iterate through
            visibleMemberIndex = 0,
            memberIndex = 0;
        while (memberIndex < this.members.length) {
            var sectionSize = 0,
                member = this.members[memberIndex],
                currentMemberMargin = 0
            ;

            // determine the size of the entire section (header + all expanded items)
            while (member != null &&
                (member == section || (section.items && section.items.contains(member)))) {
                if (member.isVisible()) {
                    sectionSize  += this.memberSizes[visibleMemberIndex];
                    currentMemberMargin = this.membersMargin + this.getMemberGap(member);
                    sectionSize += currentMemberMargin;
                    visibleMemberIndex++;
                }

                memberIndex += 1
                member = this.members[memberIndex];

            }

            // At this point we know how tall the section is
            if (coord < (totalSize + ((sectionSize-currentMemberMargin)/2))) {
                // respect an explicit canDropBefore setting, which prevents dropping before a
                // section
                if (section && section.canDropBefore === false) return false;
                return this.members.indexOf(section);
            }

            // Otherwise, increase the total size and look at the next section
            totalSize += sectionSize;
            sectionIndex += 1;
            section = this.sections[sectionIndex];
       }
       // At this point we've gone through all members -- dropping at end
       return this.members.length;

    },

    drop : function () {
        if (!this.willAcceptDrop()) return;
        var dropPosition = this.getDropPosition(),
            dropComponent = this.getDropComponent(isc.EventHandler.getDragTarget(), dropPosition),
            isSection = this.sections && this.sections.contains(dropComponent),
            section = dropComponent
        ;

        if (!isSection) {
            if (this.canDropComponents) {
                // dropping some widget into the stack - add the widget into the items array of
                // the relevent section at an appropriate location
                section = this.sectionForMemberIndex(dropPosition);
                var indexInSection = dropPosition - (this.getMemberNumber(section) + 1);
                this.addItem(section, dropComponent, indexInSection);
            } else {
                // canDropComponents is false - just do a normal addMember()
                this.addMember(dropComponent, dropPosition);
            }
        } else if (isSection && this.canReorderSections) {
            // section-reorder
            var currentSectionIndex = this.sections.indexOf(section),
                newSectionIndex;

            var dropMember = this.members[dropPosition];
            if (dropMember == null) {
                newSectionIndex = this.sections.length;
            } else {
                for (var i = 0; i < this.sections.length; i++) {
                    if (dropMember == this.sections[i] ||
                        (this.sections[i].items && this.sections[i].items.contains(dropMember)))
                    {
                        newSectionIndex = i;
                    }
                }
            }
            // There's an offset to consider: if dropping *after* our current position we'll
            // be removing this section from the sections array (and all the members from the
            // members array) and re-adding in the new spot so
            // If a section is initially at index 2:
            // - Dropping at 0, or 1 will slot into those positions
            // - Dropping at 2 is a drop onto current position (no change)
            // - Dropping at 3 is a drop between self and next item - so also no change
            // - Dropping at 4 or 5 will remove us from slot 2, meaning we actually want to
            //   drop at 3 or 4.
            var dropAfter = newSectionIndex > currentSectionIndex;
            if (dropAfter) {
                newSectionIndex -=1;
            }

            if (newSectionIndex == currentSectionIndex) {
                return;
            }
            this.sections.slide(currentSectionIndex, newSectionIndex);

            var start = this.members.indexOf(section),
                end = start +1,
                items = section.items || [];
            for (var i = 0; i < items.length; i++) {
                if (this.members.contains(items[i])) end += 1;
            }
            if (dropAfter) dropPosition -= (end-start);

            this.logInfo("Drag reorder of sections - section:" +
                section + " moved to:" + newSectionIndex + " - reordering members from " + start +
                " to " + end + " target position:" + dropPosition);

            this.reorderMembers(start, end, dropPosition);
        }

    },

    //> @method sectionStack.addItem
    // Add a canvas as an item to a section.
    // @param section (String or Number) ID or index of the section to add item to
    // @param item (Canvas) Item to insert into the section
    // @param index (Number) Index into section to insert item
    // @visibility external
    //<
    addItem : function (section, item, index) {
        var canvas = this.createCanvas(item);
        if (!isc.isA.Canvas(canvas)) {
            this.logWarn("addItem passed:" + this.echo(item) +
                    " cannot be resolved to a Canvas - ignoring");
            return
        }
        var sectionHeader = this.getSection(section);
        if (index  == null) index = 0;
        if (index >= sectionHeader.items.length) index = sectionHeader.items.length;

        // make sure that items being added have their resizeable flag set appropriately
        if (canvas.resizeable == null) {
            if (!this.canResizeSections) canvas.resizeable = false;
            else if (section.resizeable != null) {
                // allow both an explicit true and explicit false value.
                // - false allows fixed-sized sections
                // - true forces inherent height members to be resizeable
                canvas.resizeable = section.resizeable;
            }
        }

        sectionHeader.items.addAt(canvas, index);

        if (this.isDrawn() && this.sectionIsExpanded(sectionHeader)) {
            var memberIndex = 1 + this.members.indexOf(sectionHeader) + index;
            this.addMember(canvas, memberIndex);
        } else if (canvas.isDrawn()) {
            canvas.clear();
            canvas.deparent();
            // we'll lazily add it as a member when the section gets expanded!
        }
    },

    //> @method sectionStack.removeItem
    // Remove an item from a section.
    // @param section (String or Number) ID or index of the section to remove item from
    // @param item (Canvas) Item to remove
    // @visibility external
    //<
    removeItem : function (section, item) {
        if (!section) section = this.sectionForItem(item);
        if (!section) return;

        var sectionHeader = this.getSection(section);
        sectionHeader.items.remove(item);

        if (this.members.contains(item)) this.removeMember(item, item._isPlaceHolder);
    },

    //> @method sectionStack.setSectionProperties()
    // Set arbitrary properties for a particular section in this SectionStack. Properties will
    // be applied to the sectionHeader for the section.
    // <P>
    // Note that where APIs exist to explicitly manipulate section properties these should be
    // used in preference to this method. For example, to add or remove items in a section use
    // +link{sectionStack.addItem()} or +link{sectionStack.removeItem()}. To change the title of
    // a section, use +link{sectionStack.setSectionTitle}.
    // <P>
    // Also note that to modify properties of items within a section, call
    // the appropriate setter methods directly on the item you want to modify.
    //
    // @param section (String or Number) ID or index of the section to modify
    // @param properties (section properties) properties to apply to the section.
    // @visibility external
    //<
    setSectionProperties : function (section, properties) {
        var section = this.getSection(section);
        if (section != null) {
            if (isc.isA.Canvas(section)) {
                section.setProperties(properties);
            } else {
                isc.addProperties(section, properties);
            }
        }
    },


    // override removeChild to properly remove items / sections
    removeChild : function (child, name) {


        isc.Layout._instancePrototype.removeChild.call(this, child, name);
        //this.Super("removeChild", arguments);

        var sections = this.sections;
        if (sections) {
            for (var i = 0; i < sections.length; i++) {
                var section = sections[i];
                if (child == section) {
                    this.removeSection(child);
                    break;
                } else if (section.items && section.items.contains(child)) {
                    this.removeItem(section, child);
                    break;
                }
            }
        }
    },

    // sectionNameIndex, used for auto-generated section names per stack.
    sectionNameIndex:0,
    addSections : function (sections, position, expandOne) {
        if (sections == null) return;
        if (!isc.isAn.Array(sections)) sections = [sections];

        if (position == null || position > this.sections.length) {
            position = this.sections.length;
        }

        for (var i = 0; i < sections.length; i++) {
            var section = sections[i];

            // support sparse arrays
            if (!section) continue;

            if (section.showHeader == null) section.showHeader = true;
            if (section.canHide == null) section.canHide = true;

            // use section.expanded if explicitly set.  Otherwise default to collapsed
            // unless showHeader is false or autoShow is true (backcompat).
            var expanded = section.expanded != null ? section.expanded :
                    // previous logic was
                    // isOpen = section.autoShow || section.showHeader == false;
                    section.autoShow || section.showHeader == false;
            if (section.hidden == null) section.hidden = false;

            // normalize items to Arrays
            if (section.items == null) section.items = [];
            else if (!isc.isA.Array(section.items)) section.items = [section.items];

            for (var j = 0; j < section.items.length; j++) {
                if (isc.isAn.Object(section.items[j])) section.items[j]._containerID = this.ID;
            };

            // create a header for each section, which will also serve as the section itself.
            // NOTE: if showHeader is false, we still create a header object to represent the
            // section and track it's position in the members array, but it will never be
            // show()n, hence never drawn
            var headerClass = isc.ClassFactory.getClass(this.sectionHeaderClass),
                sectionHeader = headerClass.createRaw();
            sectionHeader.autoDraw = false;
            sectionHeader._generated = true;
            sectionHeader.expanded = expanded;
            sectionHeader.isSectionHeader = true;

            // if you specify hidden:true and expanded: true, then expanded wins
            sectionHeader.visibility = (section.hidden || section.showHeader == false) ?
                isc.Canvas.HIDDEN : isc.Canvas.INHERIT;
            // a section header drag is an internal resize, never an external drop (until we
            // implement tear-offs)
            sectionHeader.dragScrollType = "parentsOnly";
            sectionHeader.dragScrollDirection =
                this.vertical ? isc.Canvas.VERTICAL : isc.Canvas.HORIZONTAL;

            sectionHeader.layout = this;
            if (this.vertical) sectionHeader.height = this.headerHeight;
            else sectionHeader.width = this.headerHeight;


            // Name vs ID
            // As of Jan 2010, sections within a section stack may be referenced by the "name"
            // property. This is a unique identifier for the section within the stack.
            // A developer may also specify an ID for the section, which will by default be
            // passed through to the generated SectionHeader widget
            // (meaning it must be unique within the page, not just within the sectionStack)

            // BackCompat: 20100115
            // Previous behavior was that the ID property behaved exactly like the "name"
            // property of a section -- it was an identifier that could be used to retrieve
            // a section and was not applied to the widget as the widget-ID so could be
            // unique within a section-stack but not within the page.
            // This proved tricky to work with especially in SmartGWT where it was hard to
            // retrieve this ID from a generated SectionHeader widget (as getID() returned the
            // widget ID).
            // For backwards compatibility:
            // - if a section has a specified ID but no name, the ID will be copied over to the
            //   name slot, so getSection() et al will continue to work with the specified ID
            // - if this.useGlobalSectionIDs is false, we will not apply the specified ID
            //   property to the generated widget (so it doesn't have to be page-unique).
            var name = null, resetID = null;
            if (section.name != null) name = section.name;
            if (section.ID != null) {
                if (name == null) name = section.ID;
                // If an ID was specified, support passing it through to the generated
                // widget (will do this by default)
                if (!this.useGlobalSectionIDs) {
                    resetID = section.ID;
                    delete section.ID;
                    delete section._autoAssignedID;
                } else {
                    // detect anything with a matching global ID - this'll trip a collision
                    // which may be quite confusing in a live app.
                    var collision = window[section.ID];
                    if (collision != null) {
                        this.logWarn("Note: Section Stack Section has ID specified as '" +
                            section.ID + "'. This collides with an existing " +
                            (isc.isA.Canvas(collision) ? "SmartClient component ID." :
                                                        "object reference.") +
                            " The existing object will be replaced by the generated header" +
                            " for this section. To avoid applying section IDs to their" +
                            " corresponding section headers, you can set" +
                            " sectionStack.useGlobalSectionIDs to false");
                    }
                }
            }

            // If no name was specified, auto-generate one. This will allow methods like
            // getExpandedSections() to return something useful and reliable
            if (name == null) {
                name = "section" + this.sectionNameIndex++;
                //this.logWarn("name/sne:" + [name,this.sectionNameIndex]);
            }

            var oldName = name,
                collidingSection = this.sections.find("name", name);
            while (collidingSection != section && collidingSection != null) {
                name = "section" + this.sectionNameIndex++;
                collidingSection = this.sections.find("name", name);
            }
            if (oldName != name) {
                this.logWarn("Specified name for section:" + oldName + " collided with name for " +
                      "existing section in this stack. Replacing with auto-generated name:"+ name);
            }
            // actually hang onto the name (which may have changed)
            section.name = name;

            isc.addProperties(sectionHeader, section);


            sectionHeader.__ref = null;
            delete sectionHeader.__module;

            // store the section config object directly on the section header and vice versa
            sectionHeader._sectionConfig = section;

            // section header dragging - governable via canReorderSections
            if (this.canReorderSections && sectionHeader.canReorder != false) {
                sectionHeader.canDragReposition = true;
                sectionHeader.canDrop = true;
            }

            sectionHeader.completeCreation();

            // Check if we need to dereference
            sectionHeader = isc.SGWTFactory.extractFromConfigBlock(sectionHeader);

            section._sectionHeader = sectionHeader

            // APIs to get from one to the other.
            sectionHeader.getSectionConfig=function () {
                return this._sectionConfig;
            }
            section.getSectionHeader = function () {
                return this._sectionHeader;
            }

            // if we cleared the ID so as not to effect the generated widget ID,
            // restore it now so the user can continue to reference the attribute on
            // the config object originally passed in if necessary.
            if (resetID != null) {
                section.ID = resetID;
            }

            section = sectionHeader;

            this.sections.addAt(section, position+i);

            this.addMember(section, this._getSectionPosition(section));
            // expand any non-collapsed sections.  This will add the section's items as members
            if (expanded && !section.hidden) {
                this.expandSection(section);
            // If it's not expanded - ensure any drawn section items are cleared since they may
            // have been drawn outside the sectionStack's scope
            } else {
                for (var ii = 0; ii < section.items.length; ii++) {
                    var item = section.items[ii];
                    if (item.parentElement && item.parentElement != this) item.deparent();
                    // note: item may not have yet been created
                    if (isc.isA.Canvas(item) && item.isDrawn()) item.clear();
                }
            }

            // apply resizeability flag to items
            if (section.items) {
                if (!this.canResizeSections) section.items.setProperty("resizeable", false);
                else if (section.resizeable != null) {
                    // allow both an explicit true and explicit false value.
                    // - false allows fixed-sized sections
                    // - true forces inherent height members to be resizeable
                    section.items.setProperty("resizeable", section.resizeable);
                }
            }
        }

        // if we were asked to make sure one section gets shown, show the first section if none
        // were marked expanded:true
        if (expandOne && this._lastExpandedSection == null) {
            var firstSectionConfig = sections.first();
            // NOTE: avoid forcing open the first section if it's config marked it explicitly
            // not expanded
            if (firstSectionConfig && !(firstSectionConfig.expanded == false)) {
                var firstSection = this.sections.first();
                this.expandSection(firstSection);
            }
        }
    },


    //> @method sectionStack.addSection()
    //
    // Add a section to the SectionStack.
    //
    // @param sections  (SectionStackSection Properties | List of SectionStackSection Properties) Initialization block
    //                  for the section or a list of initialization blocks to add.
    // @param [position]    (number) index for the new section(s) (if not specified, the section
    //                      will be added at the end of the SectionStack).
    //
    // @visibility external
    // @example sectionsAddAndRemove
    //<
    addSection : function (sections, position) {
        this.addSections(sections, position);
    },

    //> @method sectionStack.removeSection()
    //
    // Remove a section or set of sections from the SectionStack.  The removed sections' header
    // and items (if any) are automatically destroyed.
    //
    // @param sections  (Integer | String | Array of Integers | Array of Strings) Section(s) to remove.
    //                  For this parameter, you can pass the position of the section in the
    //                  SectionStack, the <code>name</code> of the section, or a List of
    //                  section <code>name</code>s or indices.
    //
    // @visibility external
    // @example sectionsAddAndRemove
    //<
    removeSection : function (sections) {

        if (!isc.isAn.Array(sections)) sections = [sections];
        for (var i = 0; i < sections.length; i++) {
            var section = this.getSectionHeader(sections[i]);
            if (section != null) {

                for (var ii = section.items.length-1; ii >= 0; ii--) {
                    var item = section.items[ii];


                    if (this.members.contains(item)) this.removeMember(item);
                }
                this.sections.remove(section);
                if (!section.destroying && !section.destroyed) section.destroy();
            }
        }
    },

    //> @method sectionStack.getSections()
    //
    // Returns a list of all +link{SectionStackSection.name,section names} in the order in which
    // they appear in the SectionStack.
    //
    // @return (List) list of all section names in the order in which they appear in the SectionStack.
    // @visibility external
    //<
    getSections : function () {
        return this.sections.getProperty("name");
    },

    //> @method sectionStack.reorderSection()
    //
    // Reorder the sections by shifting the specified section to a new position
    //
    // @param section  (Integer or String) Section to move.  You can pass the position
    //                      of the section in the SectionStack or the name of the section.
    // @param position   (number) new position index for the section.
    //
    // @deprecated As of SmartClient version 5.5, use +link{sectionStack.moveSection}.
    //
    // @visibility external
    //<
    reorderSection : function (section, newPosition) {
        this.moveSection(section, newPosition);
    },

    //> @method sectionStack.moveSection()
    //
    // Moves the specified section(s) to a new position in the SectionStack order.  If you pass
    // in multiple sections, then each section will be moved to <code>newPosition</code> in the
    // order specified by the <code>sections</code> argument.
    //
    // @param sections  (Integer | String | Array of Integer | Array of String) Section(s) to move.
    //                  For this parameter, you can pass the position of the section in the
    //                  SectionStack, the name of the section, or a List of section names/positions.
    //
    // @param position    (number) new position index for the section(s).
    //
    // @visibility external
    //<
    moveSection : function (sections, newPosition) {
        if (newPosition == null) return;



        if (!isc.isAn.Array(sections)) sections = [sections];

        // normalize initial positions to sections - indices will become
        // invalid as we go through the loop manipulating
        // this.sections.
        for (var i = 0; i < sections.length; i++) {
            var section = this.getSectionHeader(sections[i]);
            if (section == null) {
                this.logInfo("moveSection(): Unable to find header for specified section:" + sections[i] + ", skipping");
                i--;
                sections.removeAt(i);
            } else {
                sections[i] = section;
                // and pull it out from this.sections
                this.sections[this.sections.indexOf(section)] = null;
            }
        }
        this.sections.removeEmpty();
        this.sections.addListAt(sections, newPosition);

        // Now update the members array.
        var currentMemberIndex = 0;
        for (var i = 0; i < this.sections.length; i++) {

            var header = this.getSectionHeader(i),
                currentStart = this.members.indexOf(header),
                currentEnd = currentStart+1;

            var items = header.items;
            if (items != null && items.length != 0 && this.members.contains(items[0])) {
                if (currentStart == -1) {
                    currentStart = this.members.indexOf(items[0]);
                    currentEnd = currentStart;
                }
                currentEnd += items.length;
            }

            if (currentStart == -1) continue;
            this.members.slideRange(currentStart,currentEnd, currentMemberIndex);
            // next slot will be after this header and any items.
            currentMemberIndex += (currentEnd-currentStart);

        }
        this._membersReordered("moveSection() called");
    },

    //> @method sectionStack.showSection()
    //
    // Shows a section or sections.  This includes the section header and its items.  If the
    // section is collapsed, only the header is shown.  If the section is expanded, the section
    // header and all items are shown.
    //
    // @param sections (Integer | String | Array of Integers | Array of Strings)
    //                      Section(s) to show.  For this parameter, you can pass the position
    //                      of the section in the SectionStack, the name of the section, or a
    //                      List of section names / positions.
    // @param [callback] callback to fire when the sections have been shown.
    //
    // @see sectionStack.expandSection
    // @see sectionStack.scrollSectionIntoView
    // @visibility external
    // @example sectionsShowAndHide
    //<
    showSection : function (sections, callback) {
        this._showSection(sections, true, false, callback);
    },

    //> @method sectionStack.expandSection()
    //
    // Expands a section or sections.  This action shows all the items assigned to the section.
    // If the section is currently hidden, it is shown first and then expanded.  Calling this
    // method is equivalent to the user clicking on the SectionHeader of a collapsed section.
    // <var class="SmartClient">This method is called when the user clicks on SectionHeaders
    // to expand / collapse sections and so may be overridden to act as a notification method
    // for the user expanding or collapsing sections.</var>
    //
    // @param sections (Integer | String | Array of Integers | Array of Strings)
    //                      Section(s) to expand.  For this parameter, you can pass the position
    //                      of the section in the SectionStack, the name of the section, or a
    //                      List of section names/positions.
    // @param [callback] callback to fire when the section has been expanded.
    //
    // @see sectionStack.showSection
    // @see sectionStack.scrollSectionIntoView
    // @visibility external
    // @example sectionsExpandCollapse
    //<
    expandSection : function (sections, callback) {
        if (!isc.isAn.Array(sections)) sections = [sections];
        if (this.visibilityMode == "mutex") {
            // catch case where multiple sections are requested for expansion in 'mutex' mode
            if (sections.length > 1) {
                this.logWarn("expandSection(): only one section can be expanded in " +
                             "'mutex' visibility mode. Dropping all but the last.");
                sections = [sections[sections.length - 1]];
            }
            // keep only one section visible: hide the currently visible section
            var lastExpanded = this._lastExpandedSection,
                section = this.getSectionHeader(sections[0]);
            if (lastExpanded && lastExpanded != section) this.collapseSection(lastExpanded);
        }
        this._showSection(sections, false, true, callback);
    },

    _showSection : function (sections, showSection, expandSection, callback) {

        if (sections == null) return;
        if (!isc.isAn.Array(sections)) sections = [sections];

        var itemsToShow = [];
        for (var i = 0; i < sections.length; i++) {
            var section = this.getSectionHeader(sections[i]);
            // bad section specification
            if (section == null) {
                this.logWarn("showSection(): no such section [" + i + "]: " +
                              this.echo(sections[i]));
                continue;
            }

            // If section.showHeader is true and the section isn't visible, show it
            // (whether we're expanding or showing)
            if (section.showHeader && section.hidden && (showSection || expandSection)) {
                itemsToShow.add(section);
                section.hidden = false;
            }

            if (expandSection || section.expanded) {
                // Backcompat: setOpen is deprecated, but we still want to call it if
                // there's a backcompat definition. Otoh it's possible that we just have
                // setExpanded, so try that first and then call setOpen
                if (section.setExpanded && !section.setOpen) section.setExpanded(true);
                else if (section.setOpen) section.setOpen(true);

                // store the last expanded section
                this._lastExpandedSection = section;

                // NOTE: a section with no items doesn't make much sense, but it occurs in tools
                if (section.items) {

                    // normalize items specified as strings / uninstantiated objects etc
                    // to canvii
                    for (var ii = section.items.length-1; ii >= 0; ii--) {

                        var itemCanvas = this.createCanvas(section.items[ii]);
                        if (!isc.isA.Canvas(itemCanvas)) {
                            this.logWarn("Section with title:"+ section.title +
                                " contains invalid item:" + section.items[ii] +
                                " - ignoring this item.");
                            section.items.removeAt(ii);
                            continue;
                        }
                        section.items[ii] = itemCanvas;
                    }

                    // ensure the section's members are added, after the section header
                    var sectionPosition = this._getSectionPosition(section) + 1;
                    // NOTE: don't animate on add because we do the animation on showMembers
                    // instead
                    this.addMembers(section.items, sectionPosition, true);
                    itemsToShow.addList(section.items);
                }
            }
        }

        var theStack = this;
        this.showMembers(itemsToShow,
                         function () { theStack._completeShowOrExpandSection(sections, callback); }
                         );
    },

    // fired as a callback to showMembers() from showSection() and expandSection()
    _completeShowOrExpandSection : function (sections, callback) {
        // sections is always an array here because this is an internal method and sections is
        // normalized by the caller
        if (sections.length == 0) return;

        // this method jsut scrolls things into view, but if we haven't been drawn yet, then
        // there's no need to do anything.
        if (this.isDrawn()) {

            // scroll the first passed section into view
            var section = this.getSectionHeader(sections[0]);

            // bring the section that was just shown into the viewport
            if (this.vscrollOn && this.scrollSectionIntoView) {
                var firstMember = (section.showHeader ? section : section.items.first()),
                    lastMember = section.items.last();

                // NOTE: visible height wouldn't be correct until component is drawn
                this.delayCall("scrollIntoView",
                                [firstMember.getLeft(), firstMember.getTop(),
                                 firstMember.getVisibleWidth(), lastMember.getVisibleHeight(),
                                 "left", "top"], 0);
            }
        }

        if (callback != null) this.fireCallback(callback);
    },

    //> @method sectionStack.sectionForItem()
    //
    // Search for a section that contains passed item.
    //
    // @param item (Canvas) item to show
    // @return (SectionStackSection) section that contains passed item.
    //
    // @see sectionStack.expandSection
    // @visibility external
    //<
    sectionForItem : function (item) {
        if (this.sections) {
            for (var i = 0; i < this.sections.length; i++) {
                var section = this.sections[i];
                if (section) {
                    for (var j = 0; j < section.items.length; j++) {
                        if (section.items[j] == item) {
                            return section;
                        }
                    }
                }
            }
        }
    },

    sectionForMemberIndex : function (index) {
        var sectionIndex = -1;
        if (this.sections) {
            for (var i = this.sections.length-1; i>=0; i--) {
                var section = this.sections[i];
                sectionIndex = this.getMemberNumber(section);
                if (sectionIndex < index) return section;
            }
        }
    },

    //> @method sectionStack.hideSection()
    //
    // Hides a section or sections.  This includes the section header and its items.  The space
    // vacated by this action is reassigned to the nearest visible section item above this
    // section.  If there are no visible section items above this section, the space is
    // reassigned to the nearest visible section item below this section.
    //
    // @param sections (Integer | String | Array of Integer | Array of String)
    //                      Section(s) to hide.  For this parameter, you can pass the position
    //                      of the section in the SectionStack, the name of the section, or a
    //                      List of section names / positions.
    // @param [callback] callback to fire when the section has been hidden
    //
    // @see sectionStack.collapseSection
    // @visibility external
    // @example sectionsShowAndHide
    //<
    hideSection : function (sections, callback) {
        this._hideSection(sections, true, false, callback);
    },

    //> @method sectionStack.collapseSection()
    //
    // Collapse a section or sections.  This action hides all the items assigned to the
    // section.  Calling this method is equivalent to the user clicking on the SectionHeader of
    // an expanded section.
    // <var class="SmartClient">This method is called when the user clicks on SectionHeaders
    // to expand / collapse sections and so may be overridden to act as a notification method
    // for the user expanding or collapsing sections.</var>
    //
    // @param sections (Integer | String | Array of Integers | Array of Strings)
    //                      Section(s) to collapse.  For this parameter, you can pass the position
    //                      of the section in the SectionStack, the name of the section, or a
    //                      List of section positions / names
    //
    // @param [callback] callback to fire when the section has been collapsed
    // @see sectionStack.hideSection
    // @visibility external
    // @example sectionsExpandCollapse
    //<
    collapseSection : function (sections, callback) {
        this._hideSection(sections, false, true, callback);
    },

    _hideSection : function (sections, hideSection, collapseSection, callback) {
        if (sections == null) return;
        if (!isc.isAn.Array(sections)) sections = [sections];

        var itemsToHide = [];
        for (var i = 0; i < sections.length; i++) {
            var section = this.getSectionHeader(sections[i]);

            // bad section specification
            if (section == null) {
                this.logWarn("hideSection(): no such section [" + i + "]: " +
                            this.echo(sections[i]));
                continue;
            }

            if (hideSection && !section.hidden) {
                section.hidden = true;
                itemsToHide.add(section);
            }

            if (collapseSection || section.expanded) {
                // Backcompat: setOpen is deprecated, but we still want to call it if there's a
                // backcompat definition. Otoh it's possible that we just have setExpanded, so try
                // that first and then call setOpen
                if (collapseSection) {
                    if (section.setExpanded && !section.setOpen) section.setExpanded(false);
                    else if (section.setOpen) section.setOpen(false);
                }

                // clear the last expanded section if appropriate
                if (this._lastExpandedSection == section) this._lastExpandedSection = null;

                // some items may not have yet been added as members, so don't try to hide()
                // those or we'll crash in Layout
                if (section.items) {
                    for (var j = 0; j < section.items.length; j++) {
                        if (this.members.contains(section.items[j])) itemsToHide.add(section.items[j]);
                    }
                }
            }
        }

        // forceFill: override recent user resizes to fill available space.  NOTE: don't
        // forceFill if we're overflowed, as this would shrink us further after a collapse,
        // which is unexpected (this feature should be moved up to Layout as an optional
        // reaction to a hide)
        if (this.forceFill && this.getVisibleHeight() <= this.getHeight()) {
            // we want to make sure that some section(s) expand to fill the space vacated by this
            // hide/collapse.  We scan through the members array to see if one of the items
            // will be resized by the layout automatically.  If not, we pick one to forcibly
            // resize to fill the vacated space.

            // We're going to scan back from the first sectionHeader and then forward to try to
            // find an auto-resizable member and at the same time, we'll flag one that we can
            // forcefully resize if no auto-resizeable members are found.
            var startIndex = this.getMemberNumber(this.getSectionHeader(sections[0]));

            var forceResizeTarget;
            var layoutWillReflow = false;
            // scan back
            for (var i = startIndex-1; i >= 0; i--) {
                var member = this.members[i];
                if (itemsToHide.contains(member)) continue;
                if (this.memberIsDragResizeable(member)) {
                    if (this.memberHasAutoResizeableHeight(member)) {
                        layoutWillReflow = true;
                        break;
                    } else if (forceResizeTarget == null) {
                        forceResizeTarget = member;
                    }
                }
            }

            if (!layoutWillReflow) {
                // scan forward
                for (var i = startIndex+1; i < this.members.length; i++) {
                    var member = this.members[i];
                    if (itemsToHide.contains(member)) continue;
                    if (this.memberIsDragResizeable(member)) {
                        if (this.memberHasAutoResizeableHeight(member)) {
                            layoutWillReflow = true;
                            break;
                        } else if (forceResizeTarget == null) {
                            forceResizeTarget = member;
                        }
                    }
                }
            }

            if (!layoutWillReflow && forceResizeTarget != null) {
//                this.logWarn("layout will not reflow, forceResizing: " + forceResizeTarget.ID);
                forceResizeTarget._userHeight = null;
//            } else {
//                if (layoutWillReflow) this.logWarn("layout will reflow");
//                else this.logWarn("layout will not reflow and no forceResizeTarget");
            }
        }

        this.hideMembers(itemsToHide, callback);
    },

    //> @method sectionStack.sectionIsVisible()
    //
    // Returns true if the specified section is visible, false if it is not.  A section is
    // visible if it shows a header and the header is visible or if it has items and the first
    // item is visible.
    //
    // @param section (Integer|String)
    //                      Section for which you want to obtain visibility information.
    //                      For this parameter, you can pass the position of the section in the
    //                      SectionStack, or the name of the section.
    //
    // @return (boolean)      true if the section is visible, false if it is not.
    //
    // @visibility external
    //<
    sectionIsVisible : function (section) {
        section = this.getSectionHeader(section);
        if (!section) return false;

        if (section.showHeader && section.isVisible()) return true;

        // NOTE: have to consider lazy initialization case
        var sectionMember = section.items.first();
        if (sectionMember == null || !isc.isA.Canvas(sectionMember) ||
            !sectionMember.isDrawn() ||
            sectionMember.visibility == isc.Canvas.HIDDEN) return false;
        return true;
    },

    //> @method sectionStack.getVisibleSections()
    //
    // Returns the list of currently visible sections.  The list items are section names.
    //
    // @return (List)      list of hidden sections
    //
    // @visibility external
    //<
    getVisibleSections : function() {
        var visibleSections = [];
        for (var i = 0; i < this.sections.length; i++)
            if (this.sectionIsVisible(this.sections[i])) visibleSections.add(this.sections[i].name);
        return visibleSections;
    },

    //> @method sectionStack.sectionIsExpanded()
    //
    // Returns true if the specified section is expanded, false if it is collapsed.
    //
    // @param section (String|Integer)
    //                      Section for which you want to obtain information.
    //                      For this parameter, you can pass the position of the section in the
    //                      SectionStack, or the name of the section.
    //
    // @return (boolean)      true if the section is expanded, false if it is not.
    //
    // @visibility external
    //<
    sectionIsExpanded : function (section) {
        return this.getSectionHeader(section).expanded;
    },

    //> @method sectionStack.getExpandedSections()
    //
    // Returns the list of currently expanded sections.  The list items are section IDs.
    //
    // @return (List)      list of currently expanded sections
    //
    // @visibility external
    //<
    getExpandedSections : function () {
        var expandedSections = this.sections.findAll("expanded", true);
        return expandedSections == null ? [] : expandedSections.getProperty("name");
    },

    //> @method sectionStack.setSectionTitle()
    // Changes the title of a SectionHeader.
    //
    // @param section (String or Number) ID or index of the section whose title you want to change
    // @param newTitle (String) new title for the SectionHeader
    // @visibility external
    //<
    setSectionTitle : function (section, newTitle) {
        var sectionHeader = this.getSectionHeader(section);
        if (sectionHeader) sectionHeader.setTitle(newTitle);
    },

    //> @method sectionStack.getSectionHeader()
    // Return the SectionHeader for a section.
    // <P>
    // This will be an instance of the +link{sectionHeaderClass}.  Since different
    // SectionStacks may use different header classes, be careful about what APIs you rely on
    // for the section header unless you have explicitly set the
    // <code>sectionHeaderClass</code>.  In particular, use APIs such as
    // +link{setSectionTitle()} to manipulate headers indirectly wherever possible, as high
    // performance SectionStacks designed for very large numbers of sections may cache and
    // re-use headers or use other strategies that would make it invalid to store a pointer to
    // a section header, assume the header is a layout member, etc.
    //
    // @param section (String or Number) ID or index of the section for which you want the header
    // @return (SectionHeader) the section header indicated
    // @visibility external
    //<
    getSectionHeader : function (section) {
        return isc.Class.getArrayItem(section, this.sections, "name");
    },

    getSection : function (section) { return this.getSectionHeader(section) },

    // Retrieves the section config object passed in when a section stack section was first
    // created.

    getSectionConfig : function (section) {
        var sectionHeader = this.getSectionHeader(section);
        if (!isc.isA.Canvas(sectionHeader)) return sectionHeader;
        return sectionHeader._sectionConfig;
    },

    //> @method sectionStack.getSectionNumber()
    //
    // Returns the position of the specified section in the SectionStack.  The numbering is
    // zero-based.
    //
    // @param sectionName     (string) name of a section for which you want to obtain the position.
    //
    // @return (number)     Position of the section in the SectionStack or -1 if the specified
    //                      section is not a member of this SectionStack.
    //
    // @visibility external
    //<
    getSectionNumber : function (section) {
        if (isc.isA.String(section)) {
            return this.sections.findIndex("name", section);
        // handle being passed a pointer to a section directly
        } else {
            return this.sections.indexOf(section);
        }
    },

    // returns the position in the members array where the first item (header or first item in the
    // section.items array if showHeader = false) in this section should be
    //
    // for external interfaces we only care about the index of the section in this.sections,
    // because that's what all external methods take as a section identifier (among others) and
    // end users shouldn't be directly modifying the underlying Layout.
    _getSectionPosition : function (section) {
        // if the section header has already been added as a member, it's position is
        // straightforward.
        var headerPosition = this.getMemberNumber(section);
        if (headerPosition != -1) return headerPosition;

        // otherwise look for the position of the last item in the previous section
        var sectionIndex = this.sections.indexOf(section);

        // if we're the first section we start at zero
        if (sectionIndex <= 0) return sectionIndex;

        // otherwise we start after the last item of the preceding section
        var previousSection = this.sections[sectionIndex-1],
            lastMember = previousSection.items ? previousSection.items.last() : null;
        if (this.hasMember(lastMember)) {
            return this.getMemberNumber(lastMember) + 1;
        } else {
            // NOTE: sections without headers always have their items added immediately, since
            // there's no way to hide them
            return this.getMemberNumber(previousSection) + 1;
        }
    },

    //> @method SectionStack.sectionHeaderClick (A)
    // Method intended to be called by the sectionHeader when it is clicked on.
    //
    // @param sectionHeader (Canvas) the sectionHeader clicked on
    // @visibility external
    //<
    sectionHeaderClick : function (section) {
        // If onSectionHeaderClick exists, allow it to cancel default behavior

        if (this.onSectionHeaderClick && (this.onSectionHeaderClick(section) == false)) {
            return false;
        }

        // hide the currently visible pane and show the pane for the header that got clicked on
        if (this.visibilityMode == "mutex") {
            // if this section is expanded, collapse it and expand the following section
            if (this.sectionIsExpanded(section)) {
                // collapse this section
                this.collapseSection(section);
                // open next section if canCollapseAll is false
                if (!this.canCollapseAll) {
                    var sectionIndex = this.sections.indexOf(section);
                    // if last section, next section will revert back to first
                    if (sectionIndex == this.sections.getLength() - 1) sectionIndex = 0;
                    else sectionIndex += 1;
                    var nextSection = this.sections[sectionIndex];
                    // expand next section
                    this.expandSection(nextSection);
                }
                return false;
            }
            // show the new section
            this.expandSection(section);
        } else {
            // just toggle expanded/collapsed
            if (!this.sectionIsExpanded(section)) {
                this.expandSection(section);
            } else {
                this.collapseSection(section);
            }
        }
        return false; // cancel event bubbling
    },

    getSectionCursor : function (sectionHeader) {
        var cursor;
        var config = this.getSectionConfig(sectionHeader);
        if (config == null) cursor = isc.Canvas.DEFAULT;
        else if (config.cursor) cursor = config.cursor;
        else {
            if (config.canCollapse != false) {
                cursor = isc.Canvas.HAND;

            } else if (this.canRorderSections && config.canReorder != false) {
                cursor = "move";
            } else {
                cursor = isc.Canvas.DEFAULT;
            }
        }
        return cursor;

    },

    // For a given member, return the closest resizeable member _before_ us in the members
    // array.  See memberIsResizeable() for what constitutes a resizeable member.
    getDragResizeTarget : function (member) {
        var myIndex = this.getMemberNumber(member);

        // look for a member preceding us that can be resized
        var resizeTarget;
        this._resizeIgnore = 0;
        for (var i = myIndex-1; i >= 0; i--) {
            var member = this.getMember(i);
            if (this.memberIsDragResizeable(member)) {
                resizeTarget = member;
                break;
            }
            // as we pass non-resizeable members, store up their total height, which we will
            // use as offset when using the coordinate of the dragged section header to resize
            // whatever member actually gets chosen as the resize target.
            // NOTE: if we pass a section header, don't resize if the preceding member is
            // another section header, detected via the isSectionHeader flag rather than
            // isc.isA.SectionHeader since section header implementation is pluggable
            if (member.isSectionHeader || (!member.resizeable && member.isVisible()))
                this._resizeIgnore += member.getVisibleHeight();
        }

        // if there are no preceeding resizeable members, never allow resize (eg, no
        // resize is possible if you are grabbing the first section header, or a section header
        // after a series of collapsed or fixed-size sections)
        if (!resizeTarget) return null;


        // Read as:
        // - if canResizeStack is true (default), always allow resize if there is a preceeding,
        //   resizeable member, even though this *may* change the overall stack size if there
        //   isn't also a resizeable member after this section header
        // - if canResizeStack is false, only allow a resize if there is *also* a member
        //   after us that can resize, because only then will all available space still be
        //   filled.
        if (this.canResizeStack) return resizeTarget;

        // look for a member after us that can resize
        var numMembers = this.getMembers().length;
        for (var i = myIndex+1; i < numMembers; i++) {
            var member = this.getMember(i);
            // some member after the sectionHeader is resizeable, so go ahead and return the
            // resizeTarget we previously determined
            if (this.memberIsDragResizeable(member)) return resizeTarget;
        }

        return null;
    },


    memberIsDragResizeable : function (member) {
        if (!member.isSectionHeader
            && member.resizeable !== false
            && member.isVisible()
            && (!this.memberHasInherentLength(member) || member.resizeable)
            ) return true;
    },

    memberHasAutoResizeableHeight : function (member) {
        var uh = member._userHeight;
        return uh == null || (isc.isA.String(uh) && (uh == "*" || isc.endsWith(uh, "%")));
    },

    getMemberDefaultBreadth : function (member, defaultBreadth) {
        var breadth = defaultBreadth;
        if (!member.isSectionHeader) {
            if (this.itemStartIndent != null || this.itemEndIndent != null)
                breadth -= this.itemStartIndent + this.itemEndIndent;
            else breadth -= this.itemIndent;
        }
        return breadth;
    },

    getMemberOffset : function (member, defaultOffset, alignment) {
        var offset = this.itemIndent;

        if (member.isSectionHeader) return defaultOffset;
        if (this.itemStartIndent != null) offset = this.itemStartIndent;
        if (alignment == isc.Canvas.RIGHT || alignment == isc.Canvas.BOTTOM)
            offset *= -1;

        return defaultOffset + offset;
    }

});

// SectionHeader classes
// ---------------------------------------------------------------------------------------

isc._commonMediaProps = {
    icon:"[SKIN]SectionHeader/opener.gif",
    overflow:"hidden",
    baseStyle:"sectionHeader",

    // Show the disabled style in both image based headers and label-based headers
    showDisabled:true,

    // expanded/collapsed styling
    // ---------------------------------------------------------------------------------------
    expanded: false,
    setExpanded : function (expanded) {
        this.expanded = expanded;
        this.stateChanged();
    },
    //>!BackCompat 2005.12.22
    setOpen : function (isOpen) {
        this.setExpanded(isOpen);
    },
    //<!BackCompat
    getCustomState : function () { return this.expanded ? "opened" : "closed"; }
};

isc._commonHeaderProps = {
    overflow:"hidden",
    //> @attr sectionHeader.clipTitle (Boolean : true : IR)
    // If the title for this section header is too large for the available space, should the title be
    // clipped?
    // <p>
    // This feature is supported only in browsers that support the CSS UI text-overflow
    // property (IE6+, Firefox 7+, Safari, Chrome, Opera 9+).
    // @visibility external
    //<
    clipTitle:true,
    //> @attr sectionHeader.showClippedTitleOnHover (Boolean : true : IRW)
    // If true and the title is clipped, then a hover containing the full title of this section header
    // is enabled.
    // @group hovers
    // @visibility external
    //<
    showClippedTitleOnHover:true,
    wrap:false, // actually only needed for the Label-based "SectionHeader" class
    height:20,
    expanded: false,
    canCollapse: true,

    //>@method SectionHeader.getSectionStack()
    // For a SectionHeader embedded in a SectionStack, this method will return
    // a pointer to the +link{SectionStack} in which this section header is
    // embedded.
    // @return (SectionStack) Section Stack containing this section header
    // @visibility external
    //<
    //>@method ImgSectionHeader.getSectionStack()
    // @include SectionHeader.getSectionStack()
    // @visibility external
    //<
    getSectionStack : function () {
        // we store the attribute as "layout" when addSection runs
        var layout = this.layout;
        if (layout) return isc.isA.String(layout) ? window[layout] : layout;
        else return null;
    },

    // Collapse behavior
    // ---------------------------------------------------------------------------------------

    // Snap open/closed on  "space" / "enter" keypress
    // Allow resizing via ctrl+arrow keys
    keyPress : function () {
        var layout = this.getSectionStack();
        if (layout == null) return;

        var keyName = isc.EH.getKey();
        if (keyName == "Enter" || keyName == "Space") {
            if (this.canCollapse) return layout.sectionHeaderClick(this);
        } else if (keyName == "Arrow_Up" || keyName == "Arrow_Down") {
            var target = layout.getDragResizeTarget(this);
            // NOTE: don't resize if the preceding member is another section header, detected
            // via marker rather than class since section header is pluggable
            if (target == null) return false;
            var resizeStep = (keyName == "Arrow_Up" ? -5 : 5);
            this.bringToFront(); // so we aren't occluded by what we will resize
            this.resizeTarget(target, true, this.resizeInRealTime, 0, 0,
                                (this.getPageTop() + resizeStep))
            // set a flag so we know to kill the when the user releases the ctrl key
            this._keyResizeTarget = target;
        }
    },

    keyUp : function () {
        if (this._keyResizeTarget) {
            var keyName = isc.EH.getKey();
            if (keyName == "Arrow_Up" || keyName == "Arrow_Down") {
                this.finishTargetResize(this._keyResizeTarget, true, this.resizeInRealTime);
                this._keyResizeTarget = null;
            }
        }
    },

    _canFocus : function () {
        // Support setting section.canTabToHeader explicitly.
        if (this.canTabToHeader != null) return this.canTabToHeader;

        var layout = this.getSectionStack();

        // layout will be either a SectionStack or a SectionItem - support canTabToHeader and its plural
        if (layout) {
            if (layout.canTabToHeaders != null) return layout.canTabToHeaders;
            if (layout.canTabToHeader != null) return layout.canTabToHeader;
            if (isc.SectionItem && isc.isA.SectionItem(layout)) {
                var form = layout.form;
                if (form && form.canTabToSectionHeaders != null) return form.canTabToSectionHeaders;
            }
            // If canTabToHeader isn't explicitly set, allow tab to header if isc.screenReader is
            // set.
            return !!isc.screenReader;
        }
        else return true;
    },

    _hasLayout : function () {
        var layout = this.getSectionStack();
        return layout ? true : false;
    },
    // Editing
    // ---------------------------------------------------------------------------------------
    //>EditMode
    schemaName : "SectionStackSection", // schema to use when editing and serializing
    addItem : function (item, index) {
        if (!this._hasLayout()) return;

        var layout = this.getSectionStack();
        layout.addItem(this, item, index);
        // Visual Builder expects addItem to also expand this section
        layout.expandSection(this);
    },
    removeItem : function (item) {
        if (!this._hasLayout()) return;
        this.getSectionStack().removeItem(this, item);
    },
    //<EditMode

    // Resize interaction
    // ---------------------------------------------------------------------------------------
    canDrag:true,
    dragAppearance:"none",

    isSectionHeader:true,
    dragStart : function () {
        if (!this._hasLayout()) return;
        var target = this.getSectionStack().getDragResizeTarget(this);
        this._sectionDragTarget = target;
        if (target == null) return false;
        this.bringToFront(); // so we aren't occluded by what we will drag resize
    },
    dragMove : function () {
        if (!this._hasLayout()) return;
        // resizeIgnore is calculated in getDragResizeTarget(), called from dragStart();
        var resizeIgnore = this.getSectionStack()._resizeIgnore;
        var offset = 0 - isc.EH.dragOffsetY;
        this.resizeTarget(this._sectionDragTarget, true, this.resizeInRealTime, offset, resizeIgnore);
    },
    dragStop : function () {
        this.finishTargetResize(this._sectionDragTarget, true, this.resizeInRealTime);
    },

    // When a section gets destroyed, ensure all items (including those that have never been
    // added as a member to the layout) also get cleared out.
    destroy : function () {
        if (!this.expanded && this.items) {
            var items = this.items;
            for (var i = 0; i< items.length; i++) {
                if (isc.isA.Canvas(items[i]) && items[i].parentElement != this.parentElement) {
                    items[i].destroy();
                }
            }
        }
        // Destroy any specified controls for the section unless they are
        // already present in the hierarchy under the parent [happens on draw()]
        var controls = this.controls,
            cLayout = this.controlsLayout;
        if (controls) {
            if (!isc.isAn.Array(controls)) controls = [controls];
            for (var ii = 0; ii < controls.length; ii++) {
                if (controls[ii].destroy && !controls[ii].destroyed &&
                    (cLayout == null || controls[ii].parentElement != cLayout))
                {
                    controls[ii].destroy();
                }
            }
        }
        return this.Super("destroy", arguments);
    },

    // Custom Controls
    // ---------------------------------------------------------------------------------------

    //> @attr sectionHeader.controls (Array of Canvas : null : IR)
    // Custom controls to be shown on top of this section header.
    // <P>
    // These controls are shown in the +link{controlsLayout}.
    // @example sectionControls
    // @visibility external
    //<

    //> @attr imgSectionHeader.controls (Array of Canvas : null : IR)
    // @include sectionHeader.controls
    //<

    //> @attr sectionHeader.controlsLayout (AutoChild Layout : null : IR)
    // A +link{Layout} containing specified +link{controls} if any.  Sets
    // +link{layout.membersMargin}:5, +link{layout.defaultLayoutAlign}:"center", and
    // RTL-sensitive +link{layout.align} (right by default).
    // @visibility external
    //<

    //> @attr imgSectionHeader.controlsLayout (AutoChild Layout : null : IR)
    // @include sectionHeader.controlsLayout
    //<
    controlsLayoutDefaults : {
        _constructor:isc.HStack,
        defaultLayoutAlign:"center",
        snapTo:(isc.Page.isRTL() ? "L" : "R"),
        membersMargin:5,
        layoutEndMargin:5,
        addAsChild:true
    },

    _getAfterPadding : function () {
        return (this.controlsLayout == null ? null : this.controlsLayout.getVisibleWidth());
    },

    addControls : function () {
        if (!this.controls) return;

        this.addAutoChild("controlsLayout", {

            _hasTabDescendents:true,

            height:this.getInnerHeight(),
            align:this.isRTL() ? "left" : "right",
            members:this.controls,
            resized : function () {
                var label = this.creator,
                    background = this.creator.background;
                if (background != null) label = background.label;
                label.markForRedraw();
            }
        });
        this.allowContentAndChildren = true;
    },

    refreshControls : function () {
        if (!this.controls) return;
        if (!this.controlsLayout) this.addControls();

        var layout = this.controlsLayout;

        layout.addMembers(this.controls);
/*
        this.addAutoChild("controlsLayout", {
            height:this.getInnerHeight(),
            align:this.isRTL() ? "left" : "right",
            members:this.controls
        });
*/
        this.allowContentAndChildren = true;
    },

    // Printing
    // ------------------------------------------------------------------------------------------
    // When printing, pick up the printStyleName from our sectionStack if it's set
    // Note that SectionHeaders are used in sectionItems as well. In this case the parentElement
    // will be the DynamicForm which may not have printHeaderStyleName set
    getPrintStyleName : function () {
        var sectionStack = this.parentElement;
        if (sectionStack && sectionStack.printHeaderStyleName != null) {
            this.printStyleName = sectionStack.printHeaderStyleName;
        }
        return this.Super("getPrintStyleName", arguments);
    },

    // force section headers to print even though they're controls
    shouldPrint:true


};

//> @class SectionHeader
// Simple SectionHeader class based on a Label with an icon, skinnable via CSS.
//
// @treeLocation Client Reference/Layout/SectionStack
// @visibility external
//<
isc.defineClass("SectionHeader", "Label").addMethods(isc._commonHeaderProps,
                                                     isc._commonMediaProps,
{

    // We use this.title, not this.contents for the section header title
    useContents:false,

    //> @attr sectionHeader.icon   (SCImgURL : "[SKIN]SectionHeader/opener.gif" : [IRA])
    // Base filename of the icon that represents open and closed states. The default settings
    // also change the icon for disabled sections, so a total of four images are required
    // (opened, closed, Disabled_opened, Disabled_closed).
    // <P>
    // Not shown if +link{sectionStackSection.canCollapse} is false.
    //
    // @visibility external
    //<


    //> @attr sectionHeader.baseStyle    (CSSStyleName : "sectionHeader" : [IRA])
    // CSS class for the section header.
    // @visibility external
    //<

    //> @attr sectionHeader.noDoubleClicks (Boolean : true : IRA)
    // By default doubleClicks are disabled for SectionHeaders. All mouse click
    // events will be handled as single clicks. Set this property to <code>false</code>
    // to enable standard double-click handling.
    // @visibility external
    //<
    noDoubleClicks: true,

    // call our layout on click
    click : function () {
        // for certain skins (e.g. fleet) a widget inside of the sectionheader, when clicked,
        // will also cause the sectionheader to fire a click event. In that case we don't
        // want the sectionheader to register the click.
        if (this.contains(isc.EH.lastTarget)) return;
        if (!this.canCollapse || !this._hasLayout()) return;
        return this.getSectionStack().sectionHeaderClick(this);
    },

    draw : function (a,b,c,d) {
        if (isc._traceMarkers) arguments.__this = this;
        if (!this.readyToDraw()) return;


        this.align = this.isRTL() ? "right" : "left";

        // if the section cannot be collapsed, or SectionStack.showExpandControls: false, don't
        // show the expand/collapse icons and allow clicks anywhere to expand and collapse
        if (!this.canCollapse || (this._hasLayout() && this.getSectionStack() &&
            this.getSectionStack().showExpandControls == false))
        {
            this.icon = null;
            this.showIconState = false;
        }
        this.setCursor(this.getCurrentCursor());

        this.invokeSuper(isc.SectionHeader, "draw", a,b,c,d);

        this.addControls();


        if (this.headerControls != null) {
            this.headerLayout = isc.HLayout.create({
                autoDraw:false, width:this.getInnerWidth(), height:this.getInnerHeight(),
                members:this.headerControls
            });
            // Has to be a child, not a peer, so it will bubble clicks etc through if appropriate
            this.addChild(this.headerLayout);
            this.allowContentAndChildren = true;
        }
    },
    getCurrentCursor : function () {
        var cursor = this.cursor;
        // sections may be rendered outside of true sectionStacks
        // (for example in SectionItems)
        if (this.getSectionStack() && this.getSectionStack().getSectionCursor != null) {
            cursor = this.getSectionStack().getSectionCursor(this);
        }
        return cursor;
    }

    //> @method sectionHeader.titleClipped() (A)
    // Is the title of this section header clipped by +link{SectionHeader.controls,section controls}
    // or the edge of the header?
    // @return (boolean) whether the title is clipped.
    // @see attr:SectionHeader.clipTitle
    // @visibility external
    //<

    //> @method sectionHeader.titleHoverHTML()
    // Returns the HTML that is displayed by the default +link{SectionHeader.titleHover(),titleHover}
    // handler. Return null or an empty string to cancel the hover.
    // <var class="smartgwt"><p>Use <code>setTitleHoverFormatter()</code> to provide a custom
    // implementation.</var>
    // @param defaultHTML (HTMLString) the HTML that would have been displayed by default
    // @return (HTMLString) HTML to be displayed in the hover. If an empty string, then the hover
    // is canceled. If null, then the default HTML is used.
    // @visibility external
    //<

    //> @method sectionHeader.titleHover()
    // Optional stringMethod to fire when the user hovers over this section header and the title is
    // clipped. If +link{SectionHeader.showClippedTitleOnHover} is true, the default behavior is to
    // show a hover canvas containing the HTML returned by +link{SectionHeader.titleHoverHTML()}.
    // Return false to suppress this default behavior.
    // @return (boolean) false to suppress the standard hover
    // @see attr:SectionHeader.clipTitle
    // @see SectionHeader.titleClipped()
    // @group hovers
    // @visibility external
    //<

});

//> @class ImgSectionHeader
// SectionHeader class based on an HLayout with +link{StretchImg} background.
// @treeLocation Client Reference/Layout/SectionStack
// @visibility external
//<
isc.defineClass("ImgSectionHeader", "HLayout").addMethods({
    //> @attr imgSectionHeader.clipTitle
    // @include sectionHeader.clipTitle
    // @visibility external
    //<
    //> @attr imgSectionHeader.showClippedTitleOnHover
    // @include sectionHeader.showClippedTitleOnHover
    // @visibility external
    //<

    _canHover: true,

    //> @attr imgSectionHeader.icon
    // @include statefulCanvas.icon
    // @visibility external
    //<
    //> @attr imgSectionHeader.iconAlign
    // @include statefulCanvas.iconAlign
    // @visibility external
    //<
    //> @attr imgSectionHeader.iconSize
    // @include statefulCanvas.iconSize
    // @visibility external
    //<
    //> @attr imgSectionHeader.iconHeight
    // @include statefulCanvas.iconHeight
    // @visibility external
    //<
    //> @attr imgSectionHeader.iconWidth
    // @include statefulCanvas.iconWidth
    // @visibility external
    //<
    //> @attr imgSectionHeader.iconOrientation
    // @include statefulCanvas.iconOrientation
    // @visibility external
    //<
    //> @attr imgSectionHeader.prompt
    // @include canvas.prompt
    // @visibility external
    //<

    //> @attr imgSectionHeader.noDoubleClicks (Boolean : true : IRA)
    // By default doubleClicks are disabled for SectionHeaders. All mouse click
    // events will be handled as single clicks. Set this property to <code>false</code>
    // to enable standard double-click handling.
    // @visibility external
    //<
    noDoubleClicks: true,

    //> @attr ImgSectionHeader.background (AutoChild StretchImg : null : R)
    // Background of the section header, based on a StretchImg.
    // @visibility external
    //<
    backgroundDefaults : isc.addProperties({
        titleStyle:"sectionHeaderTitle",

        // These images now live in SectionHeader/ in the provided skins, but SectionStack/
        // is left as the default for backcompat with customer skins.
        src:"[SKIN]SectionStack/header.gif",


        backgroundColor:"#a0a0a0",
        // call our layout on click.  Note this function is placed on the background element so
        // that clicks on headerControls floating above the background do not trigger
        // expand/collapse
        click : function () {
            //>EditMode
            if (this.parentElement && this.parentElement.editingOn) {
                return this.Super("click", arguments);
            }
            //<EditMode
            if (this.parentElement.canCollapse) {
                if (this.parentElement.getSectionStack())
                    return this.parentElement.getSectionStack().sectionHeaderClick(this.parentElement);
            }
        },
        width:"100%", height:"100%", addAsChild:true,

        // pick up printStyleName from the header
        getPrintStyleName : function () {
            if (this.parentElement) return this.parentElement.getPrintStyleName();
            return this.Super("getPrintStyleName", arguments);
        }
    }, isc._commonMediaProps),

    getCanHover : function (a, b, c) {
        return this._canHover || this.invokeSuper(isc.ImgSectionHeader, "getCanHover", a, b, c);
    },

    setExpanded : function (expanded) {
        this.expanded = expanded;
        if (this.background) this.background.setExpanded(expanded);
    },
    //>!BackCompat 2005.12.22
    setOpen : function (isOpen) {
        this.setExpanded(isOpen);
    },
    //<!BackCompat
    setTitle : function (title) {
        this.title = title;
        if (this.background) this.background.setTitle(title);
    },

    //> @method imgSectionHeader.setIcon()
    // Change the icon being shown for the header.
    // @param icon (URL) URL of new icon
    // @visibility external
    //<
    setIcon : function (icon) {
        this.icon = icon;
        if (this.background) this.background.setIcon(icon);
    },
    //> @method imgSectionHeader.setIconOrientation()
    // If this header is showing an icon should it appear to the left or right of the title?
    // Valid options are "left" and "right".
    // @param orientation (String) the new orientation
    // @visibility external
    //<
    setIconOrientation : function (orientation) {
        this.orientation = orientation;
        if (this.background) this.background.setIconOrientation(orientation);
    },


    //> @method imgSectionHeader.setAlign()
    // Sets the horizontal alignment of the title.
    // @param align (String) the new alignment
    // @visibility external
    //<
    setAlign : function (align) {
        this.align = align;
        if (this.background) this.background.setAlign(align);
    },
    //> @method imgSectionHeader.setPrompt()
    // Sets the text shown as a tooltip for the header.
    // @param prompt (String) the new tooltip
    // @visibility external
    //<
    setPrompt : function (prompt) {
        this.prompt = prompt;
        if (this.background) this.background.setPrompt(prompt);
    },

    draw : function (a,b,c,d) {
        if (isc._traceMarkers) arguments.__this = this;
        if (!this.readyToDraw()) return;

        this.setupBackground();

        this.addControls();


        this.addAutoChildren(this.headerControls);

        this.background.sendToBack();

        this.invokeSuper(isc.ImgSectionHeader, "draw", a,b,c,d);
    },
    setupBackground : function () {

        var props = {
            title: this.title,
            clipTitle: this.clipTitle,
            // handle the clipped title hover ourselves
            showClippedTitleOnHover: false,
            _canHover: false,

            expanded: this.expanded,
            // handle focus on the header itself rather than this button.
            canFocus:false
        };
        if (this.align) props.align = this.align;
        if (this.prompt) props.prompt = this.prompt;
        if (this.icon) props.icon = this.icon;
        if (this.iconSize) props.iconSize = this.iconSize;
        if (this.iconHeight) props.iconHeight = this.iconHeight;
        if (this.iconWidth) props.iconWidth = this.iconWidth;
        if (this.iconAlign) props.iconAlign = this.iconAlign;
        if (this.iconOrientation) props.iconOrientation = this.iconOrientation;

        // if the section cannot be collapsed, or SectionStack.showExpandControls: false, don't
        // show the expand/collapse icons and allow clicks anywhere to expand and collapse
        if (!this.canCollapse || (this._hasLayout() && this.getSectionStack() &&
            this.getSectionStack().showExpandControls == false))
        {
            props.icon = null;
            props.showIconState = false;
        }
        props.align = this.isRTL() ? "right" : "left";
        // Make the background draggable so canReorderSections works automatically with this
        // sectionHeader class
        props.canDragReposition = this.canDragReposition;
        props.canDrop = this.canDrop;
        props.dragTarget = this;

        var cursor = this.getCurrentCursor();
        this.setCursor(cursor);
        props.cursor = cursor;

        props._getAfterPadding = function () {
            var controlsLayout = this.creator.controlsLayout;
            return (controlsLayout == null ? null : controlsLayout.getVisibleWidth());
        };

        if (this.background == null) {
            this.addAutoChild("background", props, isc.StretchImgButton);
        } else {
            this.background.setProperties(props);
        }
    },
    getCurrentCursor : function () {
        var cursor = this.cursor;
        // sections may be rendered outside of true sectionStacks
        // (for example in SectionItems)
        if (this.getSectionStack() && this.getSectionStack().getSectionCursor != null) {
            cursor = this.getSectionStack().getSectionCursor(this);
        }
        return cursor;
    },

    // Override getPrintHTML to just return the title HTML with the appropriate styling
    getPrintHTML : function (props) {
        if (this.background == null) this.setupBackground();
        return this.background.getPrintHTML(props);
    },

    //> @method imgSectionHeader.titleClipped() (A)
    // Is the title of this section header clipped by +link{ImgSectionHeader.controls,section controls}
    // or the edge of the header?
    // @return (boolean) whether the title is clipped.
    // @see attr:ImgSectionHeader.clipTitle
    // @visibility external
    //<
    titleClipped : function () {
        return (this.background == null ? false : this.background.titleClipped());
    },

    defaultTitleHoverHTML : function () {
        return (this.background == null ? null : this.background.defaultTitleHoverHTML());
    },

    //> @method imgSectionHeader.titleHoverHTML()
    // Returns the HTML that is displayed by the default +link{ImgSectionHeader.titleHover(),titleHover}
    // handler. Return null or an empty string to cancel the hover.
    // <var class="smartgwt"><p>Use <code>setTitleHoverFormatter()</code> to provide a custom
    // implementation.</var>
    // @param defaultHTML (HTMLString) the HTML that would have been displayed by default
    // @return (HTMLString) HTML to be displayed in the hover. If null or an empty string, then the hover
    // is canceled.
    // @visibility external
    //<
    titleHoverHTML : function (defaultHTML) {
        return defaultHTML;
    },

    handleHover : function (a, b, c) {
        // If there is a prompt, prefer the standard hover handling.
        if (this.canHover == null && this.prompt) return this.invokeSuper(isc.ImgSectionHeader, "handleHover", a, b, c);

        if (!this.showClippedTitleOnHover || !this.titleClipped()) {
            if (this.canHover) return this.invokeSuper(isc.ImgSectionHeader, "handleHover", a, b, c);
            else return;
        }

        if (this.titleHover && this.titleHover() == false) return;

        var HTML = this.titleHoverHTML(this.defaultTitleHoverHTML());
        if (HTML != null && !isc.isAn.emptyString(HTML)) {
            var hoverProperties = this._getHoverProperties();
            isc.Hover.show(HTML, hoverProperties, null, this);
        }
    }
});


isc.ImgSectionHeader.addMethods(isc._commonHeaderProps);

isc.ImgSectionHeader.registerStringMethods({
    //> @method imgSectionHeader.titleHover()
    // Optional stringMethod to fire when the user hovers over this section header and the title is
    // clipped. If +link{ImgSectionHeader.showClippedTitleOnHover} is true, the default behavior is to
    // show a hover canvas containing the HTML returned by +link{ImgSectionHeader.titleHoverHTML()}.
    // Return false to suppress this default behavior.
    // @return (boolean) false to suppress the standard hover
    // @see attr:ImgSectionHeader.clipTitle
    // @see ImgSectionHeader.titleClipped()
    // @group hovers
    // @visibility external
    //<
    titleHover : ""
});

isc.SectionStack.registerStringMethods({
    //> @method sectionStack.onSectionHeaderClick()
    // Notification method fired when the user clicks on a section header.
    // Returning false will cancel the default behavior (expanding / collapsing the section)
    // @param section (SectionHeader) SectionHeader clicked by the user
    // @return (boolean) returning false cancels the default behavior
    // @visibility sgwt
    //<

    onSectionHeaderClick:"sectionHeader"
});

isc.SectionStack.registerDupProperties(
    "sections",
    // second array is sub-properties!
    ["items"]);












//>    @class Scrollbar
//
// The Scrollbar widget implements cross-platform, image-based scrollbars that control the
// scrolling of content in other widgets.  Scrollbar widgets are created and displayed
// automatically for widgets that require them, based on settings for +link{canvas.overflow}.
// <P>
// The scrollbar's appearance is based on a +link{StretchImg} for the "track", which consists
// of two fixed size buttons and a stretchable center segment, and the +link{ScrollThumb},
// the draggable portion of the scrollbar, also a StretchImg, with an optional
// +link{stretchImg.showGrip,grip}.
//
// @treeLocation Client Reference/Foundation
// @visibility external
//<
isc.ClassFactory.defineClass("Scrollbar", "StretchImg");

//> @class ScrollThumb
// Class used for the draggable "thumb" of a scrollbar.  Do not use directly; this class is
// documented only for skinning purposes.
//
// @treeLocation Client Reference/Foundation/ScrollBar
// @visibility external
//<

isc._thumbProperties = {
    autoDraw:false,
    _generated:true,

    // we redraw the thumb manually, not automatically with parent or master
    _redrawWithMaster:false,
    _resizeWithMaster:false,
    _redrawWithParent:false,
    containedPeer:true,


    showDisabled:false,

    skinImgDir:"images/Scrollbar/",

    // the thumb drags with a custom drag style
    canDrag:true,
    dragAppearance:isc.EventHandler.NONE,
    dragStartDistance:0, // start drag scrolling on any mouse movement
    dragScrollType:"parentsOnly",

    // stop various events from bubbling to parent of the Canvas we are scrolling
    click : isc.EventHandler.stopBubbling,
    doubleClick : isc.EventHandler.stopBubbling,
    mouseMove : isc.EventHandler.stopBubbling,

    // send special notifications for some events
    mouseOver : function () {return this.scrollbar.thumbOver();},
    mouseOut : function () {return this.scrollbar.thumbOut();},
    mouseDown : function () {return this.scrollbar.thumbDown();},
    dragStart : function () {return this.scrollbar.thumbDragStart();},
    dragMove : function () {return this.scrollbar.thumbMove();},
    dragStop : function () {return this.scrollbar.thumbDragStop();},
    mouseUp : function () {return this.scrollbar.thumbUp();},

    // bubble other events to the scrollbar
    keyPress : function () {
        return this.ns.EH.bubbleEvent(this.scrollbar, this.ns.EH.eventTypes.KEY_PRESS);
    },
    keyDown : function () {
        return this.ns.EH.bubbleEvent(this.scrollbar, this.ns.EH.eventTypes.KEY_DOWN);
    },
    keyUp : function () {
        return this.ns.EH.bubbleEvent(this.scrollbar, this.ns.EH.eventTypes.KEY_UP);
    },
    mouseWheel : function () {
        return this.ns.EH.bubbleEvent(this.scrollbar, this.ns.EH.eventTypes.MOUSE_WHEEL);
    },

    masterMoved : function () {
        // on scrollbar.setRect, we'll be positioned to our final position in response to
        // the resize, so no need to also reposition in response to the scrollbar moving
        var master = this.masterElement;
        if (master && master._settingRect) return;
        this.Super("masterMoved", arguments);
    }
};
isc.defineClass("ScrollThumb", "StretchImg").addProperties(isc._thumbProperties);
isc.ScrollThumb.addProperties({
    hSrc:"[SKIN]hthumb.gif",
    vSrc:"[SKIN]vthumb.gif",
    backgroundColor:"#EEEEEE",
    // don't reverse, even in RTL, (in case media is asymetric)
    textDirection:"ltr",
    capSize:2
});
isc.defineClass("HScrollThumb", isc.ScrollThumb).addProperties({ vertical:false });
isc.defineClass("VScrollThumb", isc.ScrollThumb);

isc.defineClass("SimpleScrollThumb", "Img").addProperties(isc._thumbProperties);
isc.SimpleScrollThumb.addProperties({
    title:"&nbsp;",
    titleStyle:"normal",
    overflow:"hidden",
    vBaseStyle:"vScrollThumb",
    hBaseStyle:"hScrollThumb",

    // we use "Img" as the base class in order to render the grip as a centered Img with no
    // separate Label component
    imageType:"center",
    hSrc:"[SKIN]hthumb_grip.gif",
    vSrc:"[SKIN]vthumb_grip.gif",
    showRollOver:true,

    statelessImage:true,

    initWidget : function () {
        if (this.vertical) {
            this.src = this.vSrc || this.src;
            this.baseStyle = this.vBaseStyle || this.baseStyle;
        } else {
            this.src = this.hSrc || this.src;
            this.baseStyle = this.hBaseStyle || this.baseStyle;
        }
        this.Super("initWidget", arguments);
    }
});
isc.defineClass("HSimpleScrollThumb", isc.SimpleScrollThumb).addProperties({ vertical:false });
isc.defineClass("VSimpleScrollThumb", isc.SimpleScrollThumb).addProperties({ vertical:true });

isc.Scrollbar.addProperties( {
    //>    @attr scrollbar.btnSize (number : 16 : [IRW])
    // The size of the square buttons (arrows) at the ends of this scrollbar. This
    // overrides the width of a vertical scrollbar or the height of a horizontal scrollbar
    // to set the scrollbar's thickness.
    // @group track
    // @visibility external
    //<
    btnSize:16,

    //>    @attr scrollbar.state (ImgState : isc.StatefulCanvas.STATE_UP : IRWA)
    // Default to the "up" state, other states are "down" and isc.StatefulCanvas.STATE_DISABLED
    // @group appearance
    //<
    state:isc.StatefulCanvas.STATE_UP,

    //>    @attr scrollbar.autoEnable (Boolean : true : [IRWA])
    // If true, this scrollbar will automatically enable when the scrollTarget is
    // scrollable (i.e., when the contents of the scrollTarget exceed its clip size in the
    // direction relevant to this scrollbar), and automatically disable when the
    // scrollTarget is not scrollable. Set this property to false for full manual control
    // over a scrollbar's enabled state.
    // @visibility external
    //<
    autoEnable:true,

    //>    @attr scrollbar.showCorner (Boolean : false : IRA)
    // If true, displays a corner piece at the bottom end of a vertical scrollbar, or the
    // right end of a horizontal scrollbar. This is typically set only when both horizontal
    // and vertical scrollbars are displayed and about the same corner.
    // @group corner
    // @visibility external
    //<
    //showCorner:false,

    //> @attr scrollbar.allowThumbDownState    (Boolean : false : IRA)
    // If true, the thumb's appearance changes when it's clicked on.
    // @group thumb
    // @visibility external
    //<
    allowThumbDownState:false,

    //> @attr scrollbar.allowThumbOverState    (Boolean : false : IRA)
    // If true, the thumb's appearance changes when the user rolls over it.
    // @group thumb
    // @visibility external
    //<
    allowThumbOverState:false,

    //> @attr scrollbar.showTrackEnds    (Boolean : false : IRA)
    // If true, the scrollbar uses a 5-segment rather than 3-segment image representation,
    // where the 3 interior image segments have the same state (Down, Over, etc), independent
    // of the two outermost image segments.
    // <P>
    // This allows certain advanced skinning designs where the track-as-such (space in which
    // the thumb may be dragged) has curved endcaps, and is also visually stateful (that is,
    // changes when the mouse goes down, without affecting the appearance of the outermost
    // segments).
    //
    // @group track
    // @visibility external
    //<
    showTrackEnds:false,

    //> @attr scrollbar.showTrackButtons (Boolean : true : IRA)
    // Should the track buttons that allow page scrolling be shown?
    // <P>
    // @group track
    // @visibility external
    //<
    showTrackButtons:true,

    //>    @attr scrollbar.thumbMinSize   (number : 12 : IRA)
    // The minimum pixel size of the draggable thumb regardless of how large the scrolling
    // region becomes.
    // @group thumb
    // @visibility external
    //<
    thumbMinSize : 12,

    //>    @attr scrollbar.trackEndWidth   (number : 12 : IRA)
    // The minimum pixel width of the track end segments (if enabled with showTrackEnds).
    // @group track
    // @visibility external
    //<
    trackEndWidth : 12,

    //>    @attr scrollbar.trackEndHeight   (number : 12 : IRA)
    // The minimum pixel height of the track end segments (if enabled with showTrackEnds).
    // @group track
    // @visibility external
    //<
    trackEndHeight : 12,

    //>    @attr scrollbar.thumbOverlap   (number : 1 : IRA)
    // Number of pixels the thumb is allowed to overlap the buttons at each end of the track.
    // Default prevents doubling of 1px borders.  Set higher to allow media that shows curved
    // joins between the track button and ScrollThumb.
    // @group thumb
    // @visibility external
    //<
    thumbOverlap : 1,

    //>    @attr scrollbar.startThumbOverlap   (number : null : IRA)
    // Number of pixels the thumb is allowed to overlap the buttons at the start of the track.
    // Default prevents doubling of 1px borders.  Set higher to allow media that shows curved
    // joins between the track button and ScrollThumb.
    // @group thumb
    // @visibility external
    //<

    //>    @attr scrollbar.endThumbOverlap   (number : null : IRA)
    // Number of pixels the thumb is allowed to overlap the buttons at the end of the track.
    // Default prevents doubling of 1px borders.  Set higher to allow media that shows curved
    // joins between the track button and ScrollThumb.
    // @group thumb
    // @visibility external
    //<

    //> @attr scrollbar.thumbInset (number : null : IRA)
    // Inset of the thumb relative to the track.  An inset of N pixels means the thumb is 2N
    // pixels smaller in breadth than the track.
    // @group thumb
    // @visibility external
    //<
    thumbInset:0,

    overflow:isc.Canvas.HIDDEN,

    //>    @attr scrollbar.skinImgDir (URL : "images/Scrollbar/" : IRA)
    // Where are the skin images for the Scrollbar.  This is local to the +link{Page.getSkinDir(),
    // overall skin directory}.
    // @group images
    // @visibility external
    //<
    skinImgDir:"images/Scrollbar/",

    //> @attr scrollbar.cornerSrc (SCImgURL : "[SKIN]corner.gif" : IR)
    // URL for the corner image, a singular image that appears in the corner when both h and v
    // scrollbars are showing.
    // @group images
    // @visibility external
    //<
    cornerSrc : "[SKIN]corner.gif",

    //> @attr scrollbar.cornerSize (integer : null : IR)
    // Allows the size of the corner segment to be set independently of the +link{btnSize}.
    // @group corner
    // @visibility external
    //<

    //> @attr scrollbar.hSrc (SCImgURL : "[SKIN]hscroll.gif" : IR)
    // Base URL for the images used for the horizontal scrollbar track and end buttons.
    // <P>
    // See +link{StretchImg.items} for a general explanation of how this base URL is
    // transformed into various pieces and states.
    // <P>
    // For a normal 3-segment track, the suffixes "_start", "_track" and "_end" are added to
    // this URL.  The "start" and "end" images should appear to be buttons (the user can click
    // on these segments to scroll slowly).  The "track" segment provides a background for the
    // space in which the thumb can be dragged, and can also be clicked on to scroll quickly.
    // <P>
    // For a 5-segment track (+link{showTrackEnds}:true), the suffixes are "_start", "_track_start",
    // "_track", "_track_end" and "_end".
    //
    // @group images
    // @visibility external
    //<
    hSrc:"[SKIN]hscroll.gif",

    //> @attr scrollbar.vSrc (SCImgURL : "[SKIN]vscroll.gif" : IR)
    // Base URL for the images used for the vertical scrollbar track and end buttons.  See
    // +link{hSrc} for usage.
    //
    // @group images
    // @visibility external
    //<
    vSrc:"[SKIN]vscroll.gif",

    // internal attributes to allow instance level skinning of scrollbars
    // do not expose - thumb should be implemented as autoChild instead
    hThumbClass: isc.HScrollThumb,
    vThumbClass: isc.VScrollThumb,

    // Images for parts of the scrollbar, initialized in scrollbar.initWidget
    // ----------------------------------------------------------------------------------------

    //> @attr scrollbar.startImg (StretchItem : see below : IR)
    // The StretchItem for the start of a scrollbar (the "scroll up" or "scroll left" button
    // image). The default is:
    // <var class="smartclient"><code>{ name:"start", width:"btnSize", height:"btnSize" }</code></var>
    // <var class="smartgwt"><code>new StretchItem("start", "btnSize", "btnSize")</code></var>
    // @visibility external
    //<
    startImg:      {name:"start",       width:"btnSize",        height:"btnSize"},

    //> @attr scrollbar.trackStartImg (StretchItem : see below : IR)
    // The StretchItem for the start of a scrollbar track. The default is:
    // <var class="smartclient"><code>{ name:"track_start", width:"trackStartSize", height:"trackStartSize" }</code></var>
    // <var class="smartgwt"><code>new StretchItem("track_start", "trackStartSize", "trackStartSize")</code></var>
    // @visibility external
    //<
    trackStartImg: {name:"track_start", width:"trackStartSize", height:"trackStartSize"},

    //> @attr scrollbar.trackImg (StretchItem : see below : IR)
    // The StretchItem for the middle part of a scrollbar track, which usually takes up the majority
    // of the width or height of the scrollbar. The default is:
    // <var class="smartclient"><code>{ name:"track", width:"*", height:"*" }</code></var>
    // <var class="smartgwt"><code>new StretchItem("track", "*", "*")</code></var>
    // @visibility external
    //<
    trackImg:      {name:"track",       width:"*",              height:"*"},

    //> @attr scrollbar.trackEndImg (StretchItem : see below : IR)
    // The StretchItem for the end of a scrollbar track. The default is:
    // <var class="smartclient"><code>{ name:"track_end", width:"trackEndSize", height:"trackEndSize" }</code></var>
    // <var class="smartgwt"><code>new StretchItem("track_end", "trackEndSize", "trackEndSize")</code></var>
    // @visibility external
    //<
    trackEndImg:   {name:"track_end",   width:"trackEndSize",   height:"trackEndSize"},

    //> @attr scrollbar.endImg (StretchItem : see below : IR)
    // The StretchItem for the end of a scrollbar (the "scroll down" or "scroll right" button
    // image). The default is:
    // <var class="smartclient"><code>{ name:"end", width:"btnSize", height:"btnSize" }</code></var>
    // <var class="smartgwt"><code>new StretchItem("end", "btnSize", "btnSize")</code></var>
    // @visibility external
    //<
    endImg:        {name:"end",         width:"btnSize",        height:"btnSize"},

    //> @attr scrollbar.cornerImg (StretchItem : see below : IR)
    // The StretchItem for the corner between vertical and horizontal scrollbars. The width
    // and height are determined automatically, so +link{StretchItem.width} and +link{StretchItem.height}
    // set on the cornerImg StretchItem are ignored. The default is:
    // <var class="smartclient"><code>{ name:"corner" }</code></var>
    // <var class="smartgwt"><code>new StretchItem("corner", null, null)</code></var>
    // @visibility external
    //<
    cornerImg:     {name:"corner"},

    //>    @attr scrollbar.scrollTarget (Canvas : null : [IRWA])
    // The widget whose contents should be scrolled by this scrollbar. The scrollbar thumb
    // is sized according to the amount of visible vs. scrollable content in this widget.
    // @visibility external
    //<

    // don't reverse, even in RTL, since otherwise track-end arrows would point inwards

    textDirection:"ltr",

    // flag for whether or not the scrollBar should be managing its own scrollTarget.
    // set to false if a scrollTarget actually creates the scrollBar itself.
    _selfManaged:true,

    // undocumented flag scrollbar.showThumb: set to false to disable displaying thumb.
    // eventually this will also disable the track.
    showThumb:true

    // undocumented flag scrollbar.disableButtonsOnEdges: if beginning or end of scrolling
    // is reached, show either the start or end buttons as disabled, respectively.
    //disableButtonsOnEdges:false
});

isc.Scrollbar.addMethods({

//>    @method    scrollbar.initWidget()    (A)
//            creates the thumb and adds it as a peer
//            calls setScrollTarget() to set us up with the target to be scrolled
//
//        @param    [all arguments]    (object)    objects with properties to override from default
//<
initWidget : function () {

    this.invokeSuper(isc.Scrollbar,"initWidget");

    var size = this.cornerSize || this.getID() + ".btnSize-1";
    this._cornerImg = isc.addProperties({}, this.cornerImg, {width:size, height:size});

    if (null == this.startThumbOverlap)    this.startThumbOverlap  = this.thumbOverlap;
    if (null == this.endThumbOverlap)      this.endThumbOverlap    = this.thumbOverlap;

    // set up the image list for this scrollbar
    this.setItems();

    // must be after setItems() because updateButtonsOnEdges() may trigger setState.
    // If setItems() hasn't been called yet, setState() changes the global StretchImg items.
    if (this.vertical) this.setWidth(this.btnSize);
    else this.setHeight(this.btnSize);

    // create our thumb
    this.makeThumb();

    // add the thumb as a peer
    this.addPeer(this.thumb);

    // initialize us for our scrollTarget
    this.setScrollTarget();

    // call setThumb to figure out how big and where the scrollbar thumb should be
    // note: this will enable and disable the scrollbar if autoEnable is true
    this.setThumb();
},

//>    @method    scrollbar.setItems()
//        @group    appearance
//            set up the list of images for this scrollbar
//            the image list changes depending on whether we're showing a corner piece or not
//<
setItems : function () {
    // create the items

    var items = this.items = [];
    if (this.showTrackButtons == true) items.add(this.startImg);
    if (this.showTrackEnds == true) items.add(this.trackStartImg);
    items.add(this.trackImg);
    if (this.showTrackEnds == true) items.add(this.trackEndImg);
    if (this.showTrackButtons == true) items.add(this.endImg);
    if (this.showCorner) this.items.add(this._cornerImg);
},


//>    @method    scrollbar.setShowCorner()    (A)
// Start showing the corner piece.
// <p>
// Marks the scrollbar for redraw.
//
//        @param    newState        (boolean)    true == show the corner piece
//<
setShowCorner : function (newState) {
    newState = newState != false;

    // if the newState is not the same as the old state
    if (this.showCorner != newState) {
        // set the newState
        this.showCorner = newState;
        // change the image list
        this.setItems();
        // resize the images in preparation for the redraw
        this.resizeImages();
        // mark this object as dirty to be redrawn later
        this.markForRedraw("showCorner")
    }
    return newState;
},


//>    @method    scrollbar.setScrollTarget() ([])
//          Sets or clears the scrollbar's scrollTarget. If no argument is provided, then the
//          scrollTarget will be set to the scrollbar itself.
//
//      @visibility external
//      @group  scroll
//        @param    [newTarget]        (Canvas)    target canvas to be scrolled
//<
//    Make sure we have a scrollTarget defined -- use us if nothing was ever specified.
//    Also, make sure the observation relationship between the scrollbar and the scrollTarget
//    is set up.
setScrollTarget : function (newTarget) {

    // If we have been given a newTarget, stop observing the current scrollTarget that we're
    // observing.
    if (this._selfManaged &&
         this.scrollTarget != null &&
         this.isObserving(this.scrollTarget, "scrollTo"))
    {
        //stop observing (current) this.scrollTarget
        this.ignore(this.scrollTarget, "scrollTo");
    }

    // If a newTarget was specified, set the scrollTarget to it.
    // If a newTarget was not specified, we'll use the current scrollTarget. If the
    // current scrollTarget isn't set, we use the scrollBar itself to avoid
    // null pointers
    if (newTarget != null) this.scrollTarget = newTarget;
    // if a target was not specified, use ourself for the target just so stuff doesn't break
    if (this.scrollTarget == null) this.scrollTarget = this;

    // We now are sure that we have a scrollTarget. If the scrollTarget has been changed
    // then we re-observe it. Otherwise, we're done.
    // if we've got a scrollTarget and we weren't created by adjustOverflow in the target,
    //    we should observe the _adjustOverflow method of the target to make sure the
    //    size of the thumb matches the visible portion of the target.
    if (this._selfManaged &&
         this.scrollTarget != this &&
         this.scrollTarget != newTarget) {
        this.observe(this.scrollTarget, "scrollTo", "observer.setThumb()");
    }

},


//>    @method    scrollbar.setHandleDisabled()    (A)
// Extend setHandleDisabled to hide the thumb and show disabled styling when disabled.
//        @group enable
//
//        @param    disabled (boolean)        true if disabling
//<
setHandleDisabled : function (disabled) {
    // clear out the auto-enabled property - if we were auto disabled, we don't want to
    // auto enable.

    // call the superclass method
    this.Super("setHandleDisabled",arguments);

    // hide the thumb if necessary, and set it's _showWithMaster flag to avoid it showing
    // when the scrollbar is shown, if the scrollbar is disabled.
    if (this.thumb) {

        if (this.scrollTarget && this.scrollTarget._delayThumbVisibility) {
            if (disabled) this.thumb.delayCall("setVisibility", [isc.Canvas.HIDDEN]);
            else this.thumb.delayCall("setVisibility", [this.visibility]);
        } else {
            if (disabled) this.thumb.setVisibility(isc.Canvas.HIDDEN);
            else this.thumb.setVisibility(this.visibility);
        }
        this.thumb._showWithMaster = !disabled;
    }

    // make sure our drawn state matches the enabled state
    if (disabled == (this.state == isc.StatefulCanvas.STATE_UP)) {
        this.setState(disabled ? isc.StatefulCanvas.STATE_DISABLED:
                                 isc.StatefulCanvas.STATE_UP );
    }

},


//>    @method    scrollbar.setVisibility()    (A)
// Extended to ensure thumb is placed correctly when this scrollbar is shown.
//        @group    visibility
//
//        @param    newState        (boolean)    new visible state
//<
setVisibility : function (newState,b,c,d) {
    this.invokeSuper(isc.Scrollbar, "setVisibility", newState,b,c,d);
    if (this.isVisible()) this.setThumb();
},

//>    @method    scrollbar.parentVisibilityChanged()    (A)
// Extended to ensure thumb is placed correctly when this scrollbar is shown due to a hidden
// ancestor being shown.
//        @group    visibility
//
//        @param    newState        (boolean)    new visible state
//<
parentVisibilityChanged : function (newState,b,c,d) {
    this.invokeSuper(isc.Scrollbar, "parentVisibilityChanged", newState,b,c,d);
    if (this.isVisible()) this.setThumb();
},

//>    @method    scrollbar.drawPeers()    (A)
//            custom drawPeers routine to size the thumb before it's drawn
//
//        @param    document        (document)
//
//        @return    ()
//<
drawPeers : function (a,b,c,d) {
    // call the routine to resize the thumb
    this.setThumb();

    // call the superclass method to actually do the drawing
    this.invokeSuper(isc.Scrollbar, "drawPeers", a,b,c,d);
},


//>    @method    scrollbar.resizePeersBy()    (A)
// Overridden to size the thumb
//
//        @param    deltaX        (number)    change in width
//        @param    deltaY        (number)    change in height
//<
resizePeersBy : function (deltaX, deltaY) {
    this.setThumb();
},

makeThumb : function () {
    if (!this.showThumb) return;

    // figure out derived attributes
    var classObject = this.vertical ? this.vThumbClass : this.hThumbClass;
    this.thumb = classObject.create({
        ID:this.getID()+"_thumb",
        scrollbar:this,
        state:this.state,
        visibility:this.visibility,

        width : this.vertical ? this.getWidth() : 1,
        height : !this.vertical ? this.getHeight() : 1,

        dragScrollDirection : this.vertical ? isc.Canvas.VERTICAL : isc.Canvas.HORIZONTAL
    });

    // Down / Over styling
    // - by default when a statefulCanvas starts to be dragged we clear any down / over state
    //   on the item.
    // - we handle scrollbar thumb down / over styling independently via the allowThumbDownState
    //   allowThumbOverState attributes, and avoid clearing these states when the user starts
    //   dragging the thumb
    // - If showDown / showRollOver was set explicitly on the thumb, have those setting override
    //   allowThumbDown / allowThumbOver so a skin can set these attributes on the scrollbar thumb
    //   class and we'll react to them as expected.
    if (this.thumb.showRollOver) {
        this.allowThumbOverState = true
        this.thumb.showRollOver = false;
    }
    if (this.thumb.showDown) {
        this.allowThumbDownState = true;
        this.thumb.showDown = false;
    }
},

updateButtonsOnEdges : function () {
    // if at start/end of track, optionally disable start/end buttons
    if (this.disableButtonsOnEdges) {
        var scrollRatio = this.scrollTarget.getScrollRatio(this.vertical);
        var vpRatio = this.scrollTarget.getViewportRatio(this.vertical);

        // Because setState() also occurs on button clicks, we can't be clever and
        // store the previous ratio to optimize out duplicate setState() calls
        if (scrollRatio == 0) {
            this.setState(isc.StatefulCanvas.STATE_DISABLED, this.startImg.name);
        } else {
            this.setState(isc.StatefulCanvas.STATE_UP, this.startImg.name);
        }
        if (scrollRatio == 1 || vpRatio >= 1) {
            this.setState(isc.StatefulCanvas.STATE_DISABLED, this.endImg.name);
        } else {
            this.setState(isc.StatefulCanvas.STATE_UP, this.endImg.name);
        }
    }
},

//>    @method    scrollbar.setThumb()    (A)
// Resize the thumb so that the thumb's size relative to the track reflects the viewport size
// relative to the overall scrollable area.
//        @param    forceResize        (boolean)    if true, resize regardless of whether it is necessary
//<
setThumb : function () {
    // every time thumb is updated, check to see if buttons need disabling
    this.updateButtonsOnEdges();

    // Bail if the thumb hasn't been created yet. This happens on setWidth() / setHeight()
    // during initWidget()
    if (this.thumb == null || this._suppressSetThumb) return;



    var thumb = this.thumb,
        trackSize = this.trackSize();

    // make sure the thumb is above us (we avoid automatically redrawing the thumb, so it can
    // end up underneath the zIndex of the latest draw of the track/buttons)
    if (this.isDrawn() && thumb.isDrawn()) thumb.moveAbove(this);

    // calculate size for thumb
    var size = Math.round(this.scrollTarget.getViewportRatio(this.vertical) * trackSize);

    // don't go below a minimum thumb size (too hard to grab)
    if (!isc.isA.Number(size) || size < this.thumbMinSize) size = this.thumbMinSize;

    // don't let it exceed trackSize
    if (size > trackSize) size = trackSize;

    // always ensure the thumb's thickness matches the available space for it
    var thickness = Math.max(1, (this.vertical ? this.getWidth() : this.getHeight())
                                 - (2*this.thumbInset));
    // resize the thumb
    this.vertical ? thumb.resizeTo(thickness, size) : thumb.resizeTo(size, thickness);

    // now move the thumb according to the scroll
    this.moveThumb();
},

// Override 'setZIndex' to ensure the thumb stays above us when our z-index changes.
setZIndex : function (newIndex) {
    this.Super("setZIndex", arguments);
    if (this.thumb) this.thumb.moveAbove(this);
},

//>    @method    scrollbar.moveThumbTo()    (A)
//            move the thumb to a particular coordinate
//
//        @param    coord        (number)    new x or y coordinate to move to
//<
moveThumbTo : function (coord) {
    if (!this.thumb) return;
    if (this.vertical)
        return this.thumb.moveTo(this.getLeft() + this.thumbInset, coord);
    else
        return this.thumb.moveTo(coord, this.getTop() + this.thumbInset);
},


//>    @method    scrollbar.thumbSize()    (A)
//        @group    sizing
//            return the size of the thumb in the direction of the scroll
//        @return    (number)    the size of the thumb in the direction of the scroll
//<
thumbSize : function () {
    if (!this.thumb) return;
    return (this.vertical ? this.thumb.getHeight() : this.thumb.getWidth());
},


//>    @method    scrollbar.moveThumb()    (A)
// Move the thumb to the right place for the scroll of the target
// <P>
// May enable/disable the scrollbar if scrolling is no longer necessary because everything is
// visible.
//        @group    sizing
//<
moveThumb : function () {

    var scrollingOn = (this._selfManaged || this.scrollTarget.canScroll(this.vertical));

    if (!scrollingOn) {
        if (this.autoEnable) this.disable();
        this.moveThumbTo(this.trackStart());
        return;
    }

    if (this.autoEnable && !this.scrollTarget.isDisabled()) this.enable();
    var scrollRatio = this.scrollTarget.getScrollRatio(this.vertical),
        maxThumbPosition = this.trackSize() - this.thumbSize(),
        thumbCoord = Math.round(scrollRatio * maxThumbPosition);

    this.moveThumbTo(thumbCoord + this.trackStart());

    // If the thumb moved due to the user holding the mouse down over our track, this kills
    // repeatTrackScrolling
    var EH = isc.EH;
    if (EH.mouseIsDown() && (EH.mouseDownTarget() == this) && this.thumb.containsEvent())
        this.doneTrackScrolling();
},


_$thumb:"thumb",
//>    @method    scrollbar.trackSize()    (A)
//        @group    sizing
//            return the size of the scroll track
//        @return    (number)    size of the scroll track
//<
trackSize : function () {
    // that's the size of the 'track' object + 2,
    //    since the thumb overlaps the top and bottom buttons by 1 pixel
    // only include trackStart/End sizes if showTrackEnds isn't false
    return  this.getSize(this.getPartNum(this.trackImg.name)) +
            (this.showTrackEnds != false ?  this.getSize(this.getPartNum(this.trackStartImg.name)) : 0) +
            (this.showTrackEnds != false ? this.getSize(this.getPartNum(this.trackEndImg.name)) : 0) +
            this.startThumbOverlap + this.endThumbOverlap;
},


//>    @method    scrollbar.trackStart()    (A)
// Return where the scroll track starts
//        @group    sizing
//
//        @return    (number)    relative pixel where the scroll track starts
//<
trackStart : function () {
    if (this.vertical)
        return this.getTop() + (this.showTrackButtons ? this.btnSize : 0) - this.startThumbOverlap;
    else
        return this.getLeft() + (this.showTrackButtons ? this.btnSize : 0) - this.startThumbOverlap;
},

//>    @method    scrollbar.directionRelativeToThumb()    (A)
// Return where an x,y coordinate is in relation to the scroll thumb, accounting for direction
//
//        @return    (number)
//            negative == before thumb
//            0 == inside thumb
//            positive == after thumb
//<
directionRelativeToThumb : function () {
    if (!this.thumb) {
        // no thumb means no track: buttons only
        if (this.clickPart == this.startImg.name) return -1;
        else return 1;
    }
    var coord, thumb = this.thumb, thumbEdge, thumbSize;
    if (this.vertical) {
        coord = isc.EH.getY();
        thumbEdge = thumb.getPageTop();
        thumbSize = thumb.getHeight();
    } else {
        coord = isc.EH.getX();
        thumbEdge = thumb.getPageLeft();
        thumbSize = thumb.getWidth();
    }
    if (coord < thumbEdge) return -1;
    else if (coord > thumbEdge + thumbSize) return 1;
    return 0;
},

//>    @method    scrollbar.mouseDown()    (A)
//            mouseDown handler -- figures out what was clicked on and what to do
//        @group    event handling
//
//        @return    (boolean)    false == cancel event processing
//<
mouseDown : function () {
    // figure out which part they clicked in and remember it
    this.clickPart = this.inWhichPart();
    // if the click is in a corner, clear the clickPart
    if (this.clickPart == this.cornerImg.name) {
        this.clickPart = null;
        return isc.EH.STOP_BUBBLING;
    }

    // show that clickPart as down visually
    this._updateItemStates(isc.StatefulCanvas.STATE_DOWN, this.clickPart);

    // remember the 'direction' of the click relative to the thumb
    //     -1 = before thumb, 0 = inside thumb, 1 = after thumb
    this.startDirection = this.directionRelativeToThumb();
    // return false so we cancel event processing
    return isc.EH.STOP_BUBBLING;
},

//>    @method    scrollbar.mouseStillDown()    (A)
//            mouseStillDown handler
//        @group    event handling
//
//        @return    (boolean)    false == cancel event processing
//<
mouseStillDown : function () {
    // scroll the target according to where the mouse went down
    if (this.clickPart == this.trackImg.name || this.showTrackEnds == true &&
            (this.clickPart == this.trackStartImg.name || this.clickPart == this.trackEndImg.name)) {

        // avoid continuing to page scroll if the thumb passes the cursor
        // direction will be zero the the thumb is actually underneath the cursor
        var direction = this.directionRelativeToThumb();
        if (direction != 0 && direction == this.startDirection) {
            // Make a note of the fact that we're doing repeated track scrolls
            // Note: do this on the 2nd track scroll only - we don't want a single click in the
            // track to count as this kind of rapid scrolling
            if (this._initialTrackScroll) {
                delete this._initialTrackScroll;
                this._repeatTrackScrolling = true;
            } else if (!this._repeatTrackScrolling)
                this._initialTrackScroll = true;

            this.scrollTarget.scrollByPage(this.vertical, this.startDirection, "trackClick");
        }

    } else {
        // button click
        this.scrollTarget.scrollByDelta(this.vertical, this.startDirection, "trackButtonClick");
    }

    // return true that mouseStillDown should continue
    //return isc.EventHandler.STOP_BUBBLING;
    return true;
},

doubleClick : function () {
    //this.logWarn("scrollbar double click");

    if (isc.Browser.isIE) return this.mouseStillDown();

    // return isc.EventHandler.STOP_BUBBLING so we cancel event processing
    return isc.EH.STOP_BUBBLING;
},

_updateItemStates : function (newState, part) {
    if (part == null) return this.setState(newState);
    var defaultState = isc.StatefulCanvas.STATE_UP,
        track = (part  == this.trackImg.name ||
                 part == this.trackStartImg.name ||
                 part == this.trackEndImg.name),
        start = !track && part == this.startImg.name,
        end = !track && !start && part == this.endImg.name,
        corner = !track && !start && !end,

        trackState = track ? newState : defaultState;

    this.setState(start ? newState : defaultState, this.startImg.name);
    this.setState(trackState,this.trackImg.name);
    if (this.showTrackEnds) this.setState(trackState,this.trackStartImg.name);
    if (this.showTrackEnds) this.setState(trackState,this.trackEndImg.name);
    this.setState(end ? newState : defaultState, this.endImg.name);
    if (this.showCorner) this.setState(corner ? newState : defaultState, this.cornerImg.name);
},

//>    @method    scrollbar.mouseUp()    (A)
//        @group    event handling
//            mouseUp handler for the main scrollbar
//
//        @return    (boolean)    false == cancel event processing
//<
mouseUp : function () {
    // show the clickPart as up again visually
    if (this.clickPart) {
        var newState = this.showRollOver ?
                        isc.StatefulCanvas.STATE_OVER : isc.StatefulCanvas.STATE_UP;
        this._updateItemStates(newState, this.clickPart);
    }
    this.clickPart = null;
    this.doneTrackScrolling();

    this.updateButtonsOnEdges();

    // return isc.EventHandler.STOP_BUBBLING so we cancel event processing
    return isc.EventHandler.STOP_BUBBLING;
},

// Stop various events from propagating to the parent of the Canvas we are scrolling.
click : isc.EventHandler.stopBubbling,
handleMouseOver:isc.EH.stopBubbling,
// MouseMove - respect showRollOver - implemented to show partwise rollOver
handleMouseMove : function () {
    // clickPart should be defined if the mouse went down over this item - otherwise
    // we don't want to show a down state at all
    if (this.ns.EH.mouseIsDown() && this.clickPart) {
        // appropriate item down state should have been set already - no need to re-set
        //this._updateItemStates(isc.StatefulCanvas.STATE_DOWN, this.clickPart);
    } else if (this.showRollOver) {
        this._updateItemStates(isc.StatefulCanvas.STATE_OVER, this.inWhichPart());
    }
    return isc.EH.STOP_BUBBLING;
},

//>    @method    scrollbar.mouseOut()    (A)
//            mouseOut event handler -- clear the button hilite, if appropriate
//            may redraw the button
//        @group    events
//<
handleMouseOut : function () {
    if (this.ns.EH.mouseIsDown()) return isc.EH.STOP_BUBBLING;
    if (this.showRollOver) {
        this.setState(isc.StatefulCanvas.STATE_UP);
    }
    return isc.EH.STOP_BUBBLING;
},

// avoid triggering drag interactions on the track (possible if any of our master's parents are
// canDrag:true and aren't coded to explicitly avoid drag interactions on scrollbars)
prepareForDragging : function () { return false; },

// is the user currently scrolling by dragging the scroll thumb?
isDragScrolling : function () {
    return this._dragScrolling;
},

// is the user scrolling by holding the mouse down over the track?
isRepeatTrackScrolling : function () {
    return this._repeatTrackScrolling;
},

doneTrackScrolling : function () {
    // We're no longer repeat track scrolling
    delete this._initialTrackScroll;
    if (this.isRepeatTrackScrolling()) {
        delete this._repeatTrackScrolling;

        // notify the target we're done with 'track scrolling'
        if (this.scrollTarget && this.scrollTarget.doneFastScrolling) this.scrollTarget.doneFastScrolling();
    }
},


// Implement custom mouseOver / mouseOut handlers for the thumb to show and clear over state
// We do this rather than relying on the standard StatefulCanvas.showRollOver behavior since
// when the user starts dragging the thumb we get mouseOut event and we don't want to clear the
// state in that case - instead wait for drag stop / mouseUp

//>    @method    scrollbar.thumbOver()    (A)
// Handle mouse over the thumb
//        @group    event handling
//
//        @return    (boolean)    false == cancel event processing
//<
thumbOver : function () {
    // show the thumb as down
    if (this.allowThumbOverState) {
        this.thumb.setState(isc.StatefulCanvas.STATE_OVER);
    }
},

//>    @method    scrollbar.thumbOut()    (A)
// Handle mouse out over the thumb
//        @group    event handling
//
//        @return    (boolean)    false == cancel event processing
//<
thumbOut : function () {
    if (!isc.EH.mouseIsDown()) {
        this.thumb.setState(isc.StatefulCanvas.STATE_UP);
    }
},


//>    @method    scrollbar.thumbDown()    (A)
// Handle mouse down in the thumb
//        @group    event handling
//
//        @return    (boolean)    false == cancel event processing
//<
thumbDown : function () {
    this.clickPart = this._$thumb;

    // show the thumb as down
    if (this.allowThumbDownState) {
        this.thumb.setState(isc.StatefulCanvas.STATE_DOWN);
    }
    return isc.EventHandler.STOP_BUBBLING;
},


//>    @method    scrollbar.thumbDragStart()    (A)
// Handle drag start in the thumb
//        @group    event handling
//
//        @return    (boolean)    false == cancel event processing
//<
thumbDragStart : function () {
    // set the offsetX and offsetY so the thumb moves with the mouse properly
    var EH = isc.EH;
    EH.dragOffsetX = this.thumb.getOffsetX(EH.mouseDownEvent);
    EH.dragOffsetY = this.thumb.getOffsetY(EH.mouseDownEvent);
    this._dragScrolling = true;
    return EH.STOP_BUBBLING;
},

//>    @method    scrollbar.getEventCoord()    (A)
//            return the event coordinate we care about, in the relevant direction
//        @return    (number)    x or y coordinate, relative to our coordinate system
//<
getEventCoord : function () {
    var EH = isc.EH;
    if (this.vertical)
        return EH.getY() - this.getPageTop() - this.btnSize + this.startThumbOverlap - EH.dragOffsetY;
    else
        return EH.getX() - this.getPageLeft() - this.btnSize + this.startThumbOverlap - EH.dragOffsetX;
},


masterMoved : function (dX,dY,a,b,c,d) {
    if (this.masterElement._settingRect) return;
    return this.invokeSuper(isc.Scrollbar, "masterMoved", dX, dY, a,b,c,d);
},

//>    @method    scrollbar.thumbMove()    (A)
//            mouse move in the thumb
//
//        @return    (boolean)    false == cancel event processing
//<
thumbMove : function () {
        // get the total amount of the track that's scrollable
    var trackSize = this.trackSize() - this.thumbSize(),
        // get the Y coordinate of the event, less the track start and the offsetY from mouseDown
        eventCoord = this.getEventCoord(),
        // get ratio to scroll to
        ratio = eventCoord / trackSize;

    ratio = Math.max(0, Math.min(ratio, 1));

    this.scrollTarget.scrollToRatio(this.vertical, ratio, "thumbMove");

    return isc.EventHandler.STOP_BUBBLING;
},


//>    @method    scrollbar.thumbUp()    (A)
//            mouse up in the thumb
//
//        @return    (boolean)    false == cancel event processing
//<
thumbUp : function () {
    // The thumb can catch the mouse up events that really should be going to
    // the track, because the thumb winds up occluding the track when the button is
    // held down long enough to move the thumb to where the mouse pointer is. If we're
    // currently servicing a non-thumb click, bail out and call mouseUp.
    if (this.clickPart != this._$thumb)
        return this.mouseUp();

    // show the thumb as up
    var newState = this.allowThumbOverState && this.thumb.containsEvent() ?
                                            isc.StatefulCanvas.STATE_OVER :
                                            isc.StatefulCanvas.STATE_UP;
    this.thumb.setState(newState);
    return isc.EventHandler.STOP_BUBBLING;
},

//>    @method    scrollbar.thumbDragStop()
//  Event fired when the user stops dragging the scrollbar thumb
//<
thumbDragStop : function () {
    delete this._dragScrolling;

    // doneFastScrolling() - notifies the target that the user is no longer performing
    // rapid scrolls on the widget
    if (this.scrollTarget && this.scrollTarget.doneFastScrolling) this.scrollTarget.doneFastScrolling();

    // thumbUp will handle clearing the down state, etc.
    return this.thumbUp();
},


// pass key and mousewheel events through
keyPress : function () {
    return this.ns.EH.bubbleEvent(this.scrollTarget, this.ns.EH.eventTypes.KEY_PRESS);
},
keyDown : function () {
    return this.ns.EH.bubbleEvent(this.scrollTarget, this.ns.EH.eventTypes.KEY_DOWN);
},
keyUp : function () {
    return this.ns.EH.bubbleEvent(this.scrollTarget, this.ns.EH.eventTypes.KEY_UP);
},
mouseWheel : function () {
    return this.ns.EH.bubbleEvent(this.scrollTarget, this.ns.EH.eventTypes.MOUSE_WHEEL);
},

// If this scrollbar was created by a widget automatically, always hide by shifting to
// top/left and sizing to smallest possible size of the target.

hide : function (a,b,c,d) {
    this.invokeSuper("Scrollbar", "hide", a,b,c,d);
    if (!this._selfManaged && this.scrollTarget != null) {
        this.moveTo(this.scrollTarget.getLeft(), this.scrollTarget.getTop());
        this.resizeTo(1,1);
    }
}

});









//>    @class NativeScrollbar
//
// The NativeScrollbar widget will render in the browser as a native
// scrollbar, and has APIs allowing it to be applied to scroll content any another widget
// on the page. Essentially this behaves similarly to the +link{Scrollbar} class but will
// be rendered as a native browser scrollbar rather than  using media, thus providing the
// advantages of an independant scrollbar (support for rendering the scrollbar separate from the
// content it effects, support for "virtual scrolling" mechanisms where content size is unknown
// at initial render, etc), with a native look and feel and without requiring the loading of
// additional media on the page.
// <P>
// To enable this for a component simply set +link{canvas.showCustomScrollbars} to true and
// set +link{canvas.scrollbarConstructor} to <code>"NativeScrollbar"</code>
//
// @treeLocation Client Reference/Foundation
// @visibility nativeScrollbarClass
//<

// Implementation:
// The NativeScrollbar is overflow:"hidden". It renders an autoChild which shows native
// scrollbars and has overflow set to "scroll".
// The autoChild is sized, and the NativeScrollbar is itself scrolled such that the
// scrollbars will show in the NativeScrollbar's viewport (while the rest of the auto-child is
// clipped).
// The autoChild is populated with content such that the scrollbars render at the expected
// size, and we react to the css scroll event by scrolling our scroll target.
// We share the same basic set of APIs as the Scrollbar widget so to get a native scrollbar
// appearance a widget needs to just set ScrollbarConstructor to "NativeScrollbar" (and
// showCustomScrollbars:true



isc.ClassFactory.defineClass("NativeScrollbar", "Canvas");

isc.NativeScrollbar.addClassProperties({
    // NativeScrollbars will *always* render at the native browser SB size + 1px for the
    // spacer content.
    getScrollbarSize : function () {
        return isc.Element.getNativeScrollbarSize();
    }
});

isc.NativeScrollbar.addProperties({

    vertical:true,

    showCustomScrollbars:false,
    overflow:"hidden",

    //>    @attr nativeScrollbar.autoEnable (boolean : true : [IRWA])
    // If true, this scrollbar will automatically enable when the scrollTarget is
    // scrollable (i.e., when the contents of the scrollTarget exceed its clip size in the
    // direction relevant to this scrollbar), and automatically disable when the
    // scrollTarget is not scrollable. Set this property to false for full manual control
    // over a scrollbar's enabled state.
    // @visibility internal
    //<

    autoEnable:true,

    //scrollTarget:null,

    initWidget : function () {

        var scrollThickness = isc.NativeScrollbar.getScrollbarSize();
        // disallow a width/height that is not equal to native scrollbar size

        if (this.vertical) {
            this.setWidth(scrollThickness);
        } else {
            this.setHeight(scrollThickness);
        }

        this.setOverflow(isc.Canvas.HIDDEN);

        this.addAutoChild("scrollbarCanvas");
        this.sizeScrollbarCanvas();

        // initialize us for our scrollTarget
        this.setScrollTarget();

        // call setThumb to figure out how big and where the scrollbar thumb should be
        // note: this will enable and disable the scrollbar if autoEnable is true
        this.setThumb();
    },


    // scrollbarCanvas autoChild
    // This is a child which actually shows native scrollbars.
    // We will clip this widget in our viewport to get the appearance we want,
    // and we'll respond to the user interacting with (scrolling) this widget to give us
    // the scroll events we need.
    scrollbarCanvasDefaults:{
        overflow:"scroll",
        showCustomScrollbars:false,

        // Respond to a user scrolling this scrollbar by scrolling our scroll target
        _handleCSSScroll : function (waited, fromFocus) {
            this.Super("_handleCSSScroll", arguments);

            if (isc.Browser.isMoz && !waited && (fromFocus ||  isc.Browser.geckoVersion < 20030312))
            {
                return;
            }
            if (this._scrollingHandleDirectly) return;
            this.creator.scrollbarCanvasScrolled();
        },

        // On scrollbar resize, the scrollbarCanvas needs to also resize to stay at the
        // correct dimensions
        parentResized : function () {
            this.creator.sizeScrollbarCanvas();
            this.creator.adjustOverflow();
        }

    },
    // The scrollbarCanvas will show H and V scrollbars
    // Size it to essentially match our length and be an arbitrary width (larger than the
    // native scrollbar thickness).
    // Everything but the scrollbar we're interested in will be clipped.
    scrollbarCanvasThickness:100,
    sizeScrollbarCanvas : function () {
        var scrollThickness = isc.Element.getNativeScrollbarSize();
        // native overflow:"scroll" always shows a corner at the bottom/right edge
        // (since there are 2 sb's showing).
        // size the sb lengthwise to clip the corner if showCorner is false

        var width = this.vertical ? this.scrollbarCanvasThickness
                      : this.getInnerWidth() + (this.showCorner ? 0 : scrollThickness),
            height = !this.vertical ? this.scrollbarCanvasThickness
                      : this.getInnerHeight() + (this.showCorner ? 0 : scrollThickness);
        this.scrollbarCanvas.resizeTo(width,height);
    },
    _adjustOverflow : function () {
        this.Super("_adjustOverflow", arguments);
        // We have to keep the bottom/right edge of the scrollbarCanvas actually in view.
        // Negative top/left position on the scrollbarCanvas isn't allows so just scroll
        // ourselves to the bottom/right

        if (this.vertical) {
            this.scrollToTop();
            this.scrollToRight();
        } else {
            this.scrollToLeft();
            this.scrollToBottom();
        }
    },


    //>    @method    nativeScrollbar.setScrollTarget() ([])
    //          Sets or clears the scrollbar's scrollTarget. If no argument is provided, then the
    //          scrollTarget will be set to the scrollbar itself.
    //
    //      @visibility external
    //      @group  scroll
    //        @param    [newTarget]        (Canvas)    target canvas to be scrolled
    //<

    setScrollTarget : function (newTarget) {

        // If we have been given a newTarget, stop observing the current scrollTarget that we're
        // observing.
        if (this._selfManaged &&
             this.scrollTarget != null &&
             this.isObserving(this.scrollTarget, "scrollTo")) {
            //stop observing (current) this.scrollTarget
            this.ignore(this.scrollTarget, "scrollTo");
        }

        // If a newTarget was specified, set the scrollTarget to it.
        // If a newTarget was not specified, we'll use the current scrollTarget. If the
        // current scrollTarget isn't set, we use the scrollBar itself to avoid
        // null pointers
        if (newTarget != null) this.scrollTarget = newTarget;
        if (this.scrollTarget == null) this.scrollTarget = this;

        // We now are sure that we have a scrollTarget. If the scrollTarget has been changed
        // then we re-observe it. Otherwise, we're done.
        // if we've got a scrollTarget and we weren't created by adjustOverflow in the target,
        //    we should observe the _adjustOverflow method of the target to make sure the
        //    size of the thumb matches the visible portion of the target.
        if (this._selfManaged &&
             this.scrollTarget != this &&
             this.scrollTarget != newTarget) {
            this.observe(this.scrollTarget, "scrollTo", "observer.setThumb()");
        }

    },

    //>    @method    nativeScrollbar.setThumb()    (A)
    // Resize the thumb so that the thumb's size relative to the track reflects the viewport size
    // relative to the overall scrollable area.
    //        @param    forceResize        (boolean)    if true, resize regardless of whether it is necessary
    //<
    setThumb : function () {
        // used when animating components for performance
        if (this._suppressSetThumb) return;
        var sbc = this.scrollbarCanvas,

            scrollingOn = (this._selfManaged || this.scrollTarget.canScroll(this.vertical)),

            spacerWidth = 1,
            spacerHeight = 1;
        if (scrollingOn) {


            // calculate size for thumb
            // NOTE: We use 'getViewportRatio()' here - this is required rather than looking at
            // the target's scroll height etc directly, for virtual scrolling
            var ratio = this.scrollTarget.getViewportRatio(this.vertical);

            // basically viewportHeight/scrollHeight = viewportRatio - so make content (scrollHeight)
            // into viewportHeight / ratio
            var viewportSize = (this.vertical ? sbc.getViewportHeight() : sbc.getViewportWidth()),
                spacerLength = Math.round(viewportSize / ratio);

            if (this.vertical) spacerHeight = spacerLength;
            else spacerWidth = spacerLength;
        }
        if (sbc.spacerLength != spacerLength) {
            sbc.setContents(isc.Canvas.spacerHTML(spacerWidth,spacerHeight));
            sbc.spacerLength = spacerLength;
        }

        // now move the thumb according to the scroll
        this.moveThumb();
    },

    //>    @method    nativeScrollbar.setVisibility()    (A)
    // Extended to ensure thumb is placed correctly when this scrollbar is shown.
    //        @group    visibility
    //
    //        @param    newState        (boolean)    new visible state
    //<
    setVisibility : function (newState,b,c,d) {
        this.invokeSuper(isc.Scrollbar, "setVisibility", newState,b,c,d);
        if (this.isVisible()) this.setThumb();
    },

    //>    @method    nativeScrollbar.parentVisibilityChanged()    (A)
    // Extended to ensure thumb is placed correctly when this scrollbar is shown due to a hidden
    // ancestor being shown.
    //        @group    visibility
    //
    //        @param    newState        (boolean)    new visible state
    //<
    parentVisibilityChanged : function (newState,b,c,d) {
        this.invokeSuper(isc.Scrollbar, "parentVisibilityChanged", newState,b,c,d);
        if (this.isVisible()) this.setThumb();
    },


    // updates the thumb's position to match the scrollLeft / scrollTop of the scroll target
    moveThumb : function () {

        var scrollRatio = this.scrollTarget.getScrollRatio(this.vertical);

        var sbc = this.scrollbarCanvas;

        // scrollRatio is basically scrollTop / (scrollHeight - viewportHeight)
        // so to get scrollTop we need scrollRatio * (scrollHeight - viewportheight)
        var scrollableLength = this.vertical ? sbc.getScrollHeight() - sbc.getViewportHeight()
                                            : sbc.getScrollWidth() - sbc.getViewportWidth(),

            scrollPosition = Math.round(scrollRatio * scrollableLength);

        sbc.scrollTo(this.vertical ? 0 : scrollPosition, this.vertical ? scrollPosition : 0);


    },

    scrollbarCanvasScrolled : function () {
        var sbc = this.scrollbarCanvas,
            ratio = this.vertical ?
                    sbc.getScrollTop() / (sbc.getScrollHeight() - sbc.getViewportHeight()) :
                    sbc.getScrollLeft() / (sbc.getScrollWidth() - sbc.getViewportWidth());

        // Use scrollToRatio rather than straight "scrollTo()"
        // This allows virtual scrolling to work on the target (in GridRenderers)
        this.scrollTarget.scrollToRatio(this.vertical, ratio);
    },


    // For now NativeScrollbars don't support showing corners
    setShowCorner : function (showCorner) {
        this.showCorner = showCorner;
        this.sizeScrollbarCanvas();
    }



});









//>    @class    ScrollStick
//<

isc.ClassFactory.defineClass("ScrollStick", "Button");

// add default properties to the class
isc.ScrollStick.addProperties({
    width:20,
    title:"O",

    deadAreaSize:10,
    sensitivity:1.0
});

isc.ScrollStick.addMethods({
    mouseStillDown : function () {
        var event = isc.EH.getLastEvent(),
            // figure out distance from center of stick
            deltaX = (event.x - this.getPageLeft() - (this.getVisibleWidth()/2)),
            deltaY = (event.y - this.getPageTop() - (this.getVisibleHeight()/2));

        // don't respond near center
        if (Math.abs(deltaX) < this.deadAreaSize) deltaX = 0;
        if (Math.abs(deltaY) < this.deadAreaSize) deltaY = 0;

        // multiply scroll speed by configurable sensitivity
        deltaX *= this.sensitivity;
        deltaY *= this.sensitivity;

        // tell the target to scroll
        var scrollLeft = this.target.getScrollLeft() + deltaX,
            scrollTop = this.target.getScrollTop() + deltaY;

        //this.logWarn("deltas: " + [deltaX, deltaY] +
        //             ", scrolling target to: " + [scrollLeft, scrollTop]);

        this.target.scrollTo(scrollLeft, scrollTop);
    }
});




// Splitbar
// --------------------------------------------------------------------------------------------
// A Splitbar points to a "target" and will resize the target according to the target's minHeight
// and maxHeight.  Used as 'resizeBar's in layouts.

//> @class Splitbar
//  Subclass of the +link{class:StretchImg} class. As with the +link{class:ImgSplitbar} class,
//  widgets of this class can be displayed as a resize-bar for widgets
//  in Layouts where showResizeBar is set to true. Provides a different appearance from
//  the <code>ImgSplitbar</code> class.<br>
//  To specify the resizeBar class for some layout, use the +link{layout.resizeBarClass}
//  property.
// @see class:Layout
// @see class:ImgSplitbar
// @treeLocation Client Reference/Layout
//  @visibility external
//<





// Shared splitbar properties and methods
// Applied to 'Splitbar' class (stretchImg based) and 'ImgSplitbar' class
isc._SplitbarProperties = {

    //> @attr   Splitbar.target     (Canvas : null : R)
    // When a <code>Splitbar</code> is created by a layout, the <code>target</code> property
    // of the Splitbar will be a pointer to the member for which it is acting as a resizeBar.
    // The Splitbar will be positioned next to its target, and will resize it on drag completion.
    // <P>
    // See +link{layout.resizeBarClass},  +link{canvas.showResizeBar} and
    // +link{canvas.resizeBarTarget} for details on configuring the resize bars shown in Layouts.
    // @visibility external
    //<

    //> @attr   Splitbar.vertical    (boolean : null : R)
    // Is this split bar vertically orientated?<br>
    // When a <code>Splitbar</code> is created by a layout to be the resizeBar for some
    // member of the layout, the <code>vertical</code> property will be set to <code>true</code>
    // if the layout is horizontal, meaning this resizeBar will be taller than it is wide,
    // and will allow horizontal resizing of the member.
    // @visibility external
    //<

    //> @attr   Splitbar.src    (SCImgURL : null : IR)
    // @include StretchImg.src
    // @visibility external
    //<

    //> @attr   Splitbar.hSrc   (SCImgURL : null : IR)
    // @include StretchImg.hSrc
    // @visibility external
    //<

    //> @attr   Splitbar.vSrc   (SCImgURL : null : IR)
    // @include StretchImg.vSrc
    // @visibility external
    //<

    //> @attr   Splitbar.capSize    (integer : null : IR)
    // @include StretchImg.capSize
    // @visibility external
    //<

    //> @attr   Splitbar.skinImgDir    (string : null : IR)
    // @include Canvas.skinImgDir
    // @visibility external
    //<

    //> @attr   Splitbar.showGrip    (Boolean : null : IRA)
    // @include StretchImg.showGrip
    // @visibility external
    //<

    //> @attr   SplitBar.gripImgSuffix (string : "grip" : IRA)
    // @include StretchImg.gripImgSuffix
    // @visibility external
    //<


    //> @attr   Splitbar.showDownGrip   (Boolean : null : IRA)
    // @include StretchImg.showDownGrip
    // @visibility external
    //<

    //> @attr   Splitbar.showRollOverGrip   (Boolean : null : IRA)
    // @include StretchImg.showRollOverGrip
    // @visibility external
    //<

    //> @attr   splitbar.showClosedGrip   (Boolean : null : IRA)
    // If +link{splitbar.showGrip} is true, this property determines whether the grip image
    // displayed should show the <code>"Closed"</code> state when the +link{Splitbar.target}
    // is hidden. Note that if +link{splitBar.invertClosedGripIfTargetAfter} is true, we
    // may show the "closed" state when the target is visible, rather than when it is hidden.
    // @group grip
    // @visibility external
    //<

    //> @attr splitbar.targetAfter (Boolean : null : IRWA)
    // Is the +link{splitbar.target} being shown before or after the bar? This property is
    // automatically populated for <code>splitbar</code>s created by a layout.
    // @see splitbar.invertClosedGripIfTargetAfter
    // @visibility external
    //<

    //> @attr splitbar.invertClosedGripIfTargetAfter (boolean : true : IRWA)
    // If +link{splitBar.showClosedGrip} is true, and +link{splitbar.targetAfter} is true
    // should we show the "closed" state for the grip when the target is visible (rather than
    // when it is hidden).
    // <P>
    // This property is useful for the case where the grip media is a simple directional arrow.
    // The same image can be used for expanded state on one side of the bar or collapsed
    // state on the other.
    //
    // @visibility external
    // @group grip
    //<
    invertClosedGripIfTargetAfter:true,

    // on drag, we resize a target widget
    //> @attr   Splitbar.canDrag    (Boolean : true : IRW)
    // <code>canDrag</code> set to true to allow dragging of the split bar. Dragging the
    // Splitbar will resize it's +link{Splitbar.target, target}
    // @visibility external
    //<
    canDrag:true,

    dragAppearance:"none",

    dragStartDistance:1,

    //> @attr   Splitbar.canCollapse    (Boolean : true : IRW)
    // If this property is true, a click on the Splitbar will collapse its
    // +link{Splitbar.target, target}, hiding it and shifting the Splitbar and other members
    // of the layout across to fill the newly available space. If the target is already hidden
    // a click will expand it again (showing it at it's normal size).
    // @visibility external
    //<
    canCollapse:true,   // enables click-to-collapse behavior
    // cursor - default to different cursors based on vertical or horizontal splitbars
    //> @attr   Splitbar.cursor (Cursor : "hand" : IRW)
    // Splitbars' cursors are set at init time based on whether they are to be used for vertical or
    // horizontal resize.  To customize the cursor for this class, modify
    // +link{Splitbar.vResizeCursor} or +link{Splitbar.hResizeCursor} rather than this property.
    // @visibility external
    // @group cursor
    //<
    cursor:"hand",

    //> @attr Splitbar.vResizeCursor    (Cursor : "row-resize" : IR)
    // Cursor to display if this Splitbar is to be used for vertical resize of widgets.
    // @visibility external
    // @group cursor
    //<
    vResizeCursor:"row-resize",
    //> @attr Splitbar.hResizeCursor    (Cursor : "col-resize" : IR)
    // Cursor to display if this Splitbar is to be used for horizontal resize of widgets.
    // @visibility external
    // @group cursor
    //<
    hResizeCursor:"col-resize",

    resizeInRealTime:false,
    _redrawWithMaster:false,
    _resizeWithMaster:false,
    overflow:"hidden",


    isMouseTransparent:true

};

isc._SplitbarMethods = {

    initWidget : function () {
        // vertical switch of hSrc/vSrc is handled by StretchImg, but not by Img
        if (isc.isA.Img(this)) this.src = this.vertical ? this.vSrc : this.hSrc;

        if (this.vertical) {
            this.defaultWidth = this.defaultWidth || 10;
            this.cursor = this.hResizeCursor;
            this.baseStyle = this.vBaseStyle || this.baseStyle;
        } else {
            this.defaultHeight = this.defaultHeight || 10;
            this.cursor = this.vResizeCursor;
            this.baseStyle = this.hBaseStyle || this.baseStyle;
        }

        this.Super("initWidget", arguments);


        if (isc.Browser.isMoz) this.bringToFront();

    },

    prepareForDragging : function () {
        // first time run - remember default 'canDrag'
        if (this._canDragWhenVisible == null) {
            this._canDragWhenVisible = this.canDrag;
        }
        if (this._canDragWhenTargetIsHidden == null) {
            this._canDragWhenTargetIsHidden = false;
        }

        if (this.target.visibility == isc.Canvas.HIDDEN) {
            this.canDrag = this._canDragWhenTargetIsHidden;
        } else {
            this.canDrag = this._canDragWhenVisible;
        }
        return this.Super("prepareForDragging", arguments);
    },

    // Override 'makeLabel' to ensure the label, showing any 'grip' image picks up the custom
    // closed state for the grip if appropriate

    makeLabel : function () {
        this.Super("makeLabel", arguments);
        this.label.addMethods({
            getCustomState : function () {
                var bar = this.masterElement;
                if (!bar.showClosedGrip) return

                var target = bar.target,
                    isHidden = target.visibility == isc.Canvas.HIDDEN;
                var invert = bar.targetAfter && bar.invertClosedGripIfTargetAfter;

                if ((!invert && isHidden) || (invert && !isHidden)) {
                    return "closed";
                }
            }
        })

    },

    dragStart : function () {
        if (this.showDown) this.setState("Down"); // note: case sensitive
        this.bringToFront(); // so we aren't occluded by what we will drag resize
    },
    dragMove : function () {
        var offset = this.vertical ? (0 - isc.EH.dragOffsetX) : (0 - isc.EH.dragOffsetY);
        this.resizeTarget(this.target, !this.vertical, this.resizeInRealTime, offset,
                          null, null, this.targetAfter);
    },
    dragStop : function () {
        if (this.showDown) this.setState("");
        this.finishTargetResize(this.target, !this.vertical, this.resizeInRealTime);
    },

    click : function () {
        if (this.canCollapse != true) return;
        // toggle target visibility on click
        var target = this.hideTarget || this.target;

        if (!this.target) return;

        // Note: call showMember/hideMember so animation kicks in if configured on the Layout
        if (target.visibility == 'hidden') {
            if (isc.isA.Layout(target.parentElement)) target.parentElement.showMember(target);
            else target.show();

        } else {
            if (isc.isA.Layout(target.parentElement)) target.parentElement.hideMember(target);
            else target.hide();
        }
        // HACK: fixes problem where the bar can remain stuck in "over" state until the next
        // mouse move, because the bar is moved out from under the mouse by the relayout that
        // follows hiding our target.
        this.setState("");
    }
};


// Splitbar (Doc'd at the top of the file)
isc.defineClass("Splitbar","StretchImg").addProperties({
    skinImgDir:"images/Splitbar/",
    imageType:"stretch",
    capSize:3,
    vSrc:"[SKIN]vsplit.gif",
    hSrc:"[SKIN]hsplit.gif"
});
isc.Splitbar.addMethods(isc._SplitbarProperties, isc._SplitbarMethods);


//> @class ImgSplitbar
//  Subclass of the +link{class:Img} class. As with the +link{class:Splitbar} class,
//  widgets of this class can be displayed as a resize-bar for widgets
//  in Layouts where showResizeBar is set to true. Provides a different appearance from
//  the <code>Splitbar</code> class.<br>
//  To specify the resizeBar class for some layout, use the +link{layout.resizeBarClass}
//  property.
// @see class:Layout
// @see class:Splitbar
// @treeLocation Client Reference/Layout
//  @visibility external
//<
isc.defineClass("ImgSplitbar","Img").addProperties({


    //> @attr   ImgSplitbar.target     (Canvas : null : R)
    // @include Splitbar.target
    // @visibility external
    //<

    //> @attr   ImgSplitbar.vertical    (Boolean : null : R)
    // @include Splitbar.vertical
    // @visibility external
    //<

    //> @attr   ImgSplitbar.canDrag    (Boolean : true : IRW)
    // @include Splitbar.canDrag
    // @visibility external
    //<

    //> @attr   ImgSplitbar.canCollapse    (Boolean : true : IRW)
    // @include Splitbar.canCollapse
    // @visibility external
    //<

    //> @attr   ImgSplitbar.skinImgDir    (SCImgURL : "images/SplitBar/" : IR)
    // @include Canvas.skinImgDir
    // @visibility external
    //<
    skinImgDir:"images/Splitbar/",
    imageType:"center",

    //> @attr   ImgSplitbar.src    (string : null : IR)
    // @include Img.src
    // @visibility external
    //<

    //> @attr   ImgSplitbar.hSrc   (string : [SKIN]hgrip.png : IR)
    // Default src to display when +link{ImgSplitbar.vertical} is false,
    // and +link{ImgSplitbar.src} is unset.
    // @see ImgSplitbar.src
    // @visibility external
    //<
    hSrc:"[SKIN]hgrip.png",

    //> @attr   ImgSplitbar.vSrc   (SCImgURL : [SKIN]vgrip.png : IR)
    // Default src to display when +link{ImgSplitbar.vertical} is true,
    // and +link{ImgSplitbar.src} is unset.
    // @see ImgSplitbar.src
    // @visibility external
    //<
    vSrc:"[SKIN]vgrip.png",

    styleName:"splitbar",
    showDown:true   // to hilite the entire bar via CSS, instead of dragging just the grip image
});
isc.ImgSplitbar.addMethods(isc._SplitbarProperties, isc._SplitbarMethods);


// StretchImgSplitbar

isc.addGlobal("StretchImgSplitbar", isc.Splitbar);

// LayoutResizeBar - for backcompat only.
// Note that "LayoutResizeBar" was used as the default 'resizeBarClassName' for the Layout class
// for builds up to and including 5.5.1
isc.addGlobal("LayoutResizeBar", isc.Splitbar);


// VSplitbar / HSplitbar
// --------------------------------------------------------------------------------------------
isc.defineClass("HSplitbar","Splitbar").addProperties({
    vertical:false
});

isc.defineClass("VSplitbar","Splitbar");

// Stretchbar
// --------------------------------------------------------------------------------------------
// This is a splitbar that only shows up on rollover

isc.defineClass("Stretchbar", "Splitbar").addProperties({
    canResize:false,
    skinImgDir:"images/Stretchbar/",
    showRollOver:true
});

// HStretchbar / VStretchbar
// --------------------------------------------------------------------------------------------
isc.defineClass("HStretchbar", "Stretchbar").addProperties({
    vertical:false,
    src:"[SKIN]hsplit.gif",
    defaultHeight:10
});

isc.defineClass("VStretchbar", "Stretchbar").addProperties({
    src:"[SKIN]vsplit.gif",
    defaultWidth:10
});



//> @class Snapbar
// Subclass of the +link{class:Splitbar} class that uses the <code>grip</code> functionality
// to show a stateful open / close indicator.
// @see class:Splitbar
// @see class:Layout
// @treeLocation Client Reference/Layout
//  @visibility external
//<
isc.defineClass("Snapbar", "Splitbar");

isc.Snapbar.addProperties({
    //> @attr   Snapbar.showRollOver    (Boolean : true : IRW)
    // Snapbars show rollover styling.
    // @visibility external
    //<
    showRollOver:true,

    //> @attr   Snapbar.showDown (Boolean : true : IRW)
    // Snapbars show mouse-down styling.
    // @visibility external
    //<
    showDown:true,

    //> @attr   Snapbar.showGrip    (Boolean : true : IRW)
    // @include Splitbar.showGrip
    // @visibility external
    //<
    showGrip:true,

    //> @attr   Snapbar.showDownGrip    (Boolean : true : IRW)
    // @include Splitbar.showDownGrip
    // @visibility external
    //<
    showDownGrip:true,

    //> @attr   Snapbar.showRollOverGrip   (Boolean : true : IRA)
    // @include Splitbar.showRollOverGrip
    // @visibility external
    //<
    showRollOverGrip:true,

    //> @attr   Snapbar.showClosedGrip   (Boolean : true : IRA)
    // @include splitbar.showClosedGrip
    // @visibility external
    // @group grip
    //<
    showClosedGrip:true,

    //> @attr Snapbar.targetAfter (Boolean : null : IRWA)
    // @include splitbar.targetAfter
    // @visibility external
    // @group grip
    //<

    //> @attr Snabbar.invertClosedGripIfTargetAfter (boolean : true : IRWA)
    // @include splitbar.invertClosedGripIfTargetAfter
    // @visibility external
    // @group grip
    //<

    //> @attr   Snapbar.gripImgSuffix (string : "snap" : IRA)
    // Overridden from +link{Splitbar.gripImgSuffix} to simplify providing custom grip media
    // for this widget.
    // @visibility external
    //<
    gripImgSuffix:"snap"

});

//> @class ToolStripResizer
// Simple subclass of ImgSplitbar with appearance appropriate for a ToolStrip resizer.
//
// @treeLocation Client Reference/Layout/ToolStrip
// @visibility external
//<
isc.defineClass("ToolStripResizer", "ImgSplitbar").addProperties({
    //> @attr toolStripResizer.skinImgDir (SCImgURL : "images/ToolStrip/" : IR)
    // Path to resizer image.
    // @visibility external
    //<
    skinImgDir:"images/ToolStrip/",

    //> @attr toolStripResizer.vSrc (SCImgURL : "[SKIN]resizer.png" : IRW)
    // Image for resizer
    // @visibility external
    //<
    vSrc:"[SKIN]resizer.png",

    //> @attr toolStripResizer.hSrc (SCImgURL : "[SKIN]hresizer.png" : IRW)
    // Image for horizontal resizer for a vertical Toolstrip
    // @visibility external
    //<
    hSrc:"[SKIN]hresizer.png",

    // prevents misalignment if ToolStrip is stretched vertically by members
    layoutAlign:"center",

    resizeInRealTime:true,
    showDown:false,

    // center the image and set imageHeight/imageWidth to avoid issues with natural sizing of
    // image with IE .pngs.  Alternatively, we could stretch (commented out), which is
    // imperfect (due to arrows in default image), but looks reasonable within the likely
    // possible heights of a ToolStrip (~ 18 - 24)
    imageLength:20, imageBreadth:14, imageType:"center",
    //imageType:"stretch",

    initWidget : function () {
        this.imageWidth = this.vertical ? this.imageBreadth : this.imageLength;
        this.imageHeight = this.vertical ? this.imageLength : this.imageBreadth;
        this.Super("initWidget", arguments);
    }

});








isc.Canvas.addClassMethods({

//>    @classMethod    Canvas.applyStretchResizePolicy()    (A)
// Add a sizing policy to a series of size specifications, either a number in pixels, a % or a
// "*".
//
// Return value is an array of sizes for each object.  No object receives less than 1 pixel
//<




_$percent : "%",
_$listPolicy : "listPolicy",
applyStretchResizePolicy : function (sizes, totalSize, minSize, modifyInPlace, propertyTarget) {
    //!OBFUSCATEOK
    if (!sizes) return;

    var percentTotal = 0,    // total percentage sizes
        starCount = 0,        // number of "*"-sized items
        staticSize = 0,        // amount that's taken up by static images
        size = 0,            // temp variable to hold the size
        resultSizes = (modifyInPlace ? sizes : []),  // the calculated sizes
        logEnabled = this.logIsDebugEnabled(this._$listPolicy),
        minSize = (minSize || 1);

    //>DEBUG  preserve the original sizes array for logging purposes
    if (logEnabled && modifyInPlace) sizes = sizes.duplicate();
    //<DEBUG

    // count up all non-static sizes
    for (var i = 0; i < sizes.length; i++) {
        size = sizes[i];
        if (size == null || isc.is.emptyString(size)) sizes[i] = size = isc.star;

        if (isc.isA.Number(size)) {
            resultSizes[i] = size;
        } else {
            if (size == isc.star) {
                // a stretch item -- increment the number of stretch items
                starCount++;
                size = 0;
            } else if (size.indexOf(this._$percent) >= 0) {
                if (propertyTarget != null && propertyTarget.fixedPercents) {
                    // treat percents as a fixed percentage of the available space
                    var percentage = parseInt(size);
                    size = resultSizes[i] = Math.round((percentage/100)*totalSize);
                } else {
                    // percentage -- add it to the percentage total
                    percentTotal += parseInt(size);
                    size = 0;
                }
            } else {
                // look for a numeric property on the propertyTarget, if passed
                if (propertyTarget && isc.isA.Number(propertyTarget[size])) {
                    size = resultSizes[i] = propertyTarget[size];
                } else {
                    // handle a number specified as a string, possibly with extra junk

                    var parsedSize = parseInt(size);
                    if (isc.isA.Number(parsedSize) && parsedSize >= 0) {
                        resultSizes[i] = size = parsedSize;
                    } else {
                        // try doing an eval
                        try {
                            size = isc.eval(size);
                        } catch (e) {
                            var logTarget = propertyTarget && propertyTarget.logWarn
                                            ? propertyTarget : this;

                            logTarget.logWarn("StretchResizePolicy: " +
                                " unable to convert size:" + size +
                                " to a valid size - reported error: '"+ e +
                                "'\n Complete set of sizes:"+ sizes);
                            size = null;
                        }
                        // and if it didn't come out to a number, set it to 0
                        if (!isc.isA.Number(size)) size = 0;
                        resultSizes[i] = size;
                    }
                }
            }
        }

        // make sure everything is zero or more pixels in size
        size = Math.max(size,0);

        // add the size to the staticSize
        staticSize += size;
    }

    // - "stars" are translated to percents, sharing all remaining percent points (of 100)
    //   not allocated to specified percent sizes
    // - stars and percents share all space not allocated to static numbers
    // - if there are any percents or stars, all space is always filled

    var starPercent = 0;
    if (starCount) {
        if (percentTotal >= 100) {
            // percents sum over 100, so star-sized items receive 0% of remaining space, hence
            // will be sized to the minimum size minimum.  Add the minimum size to staticSize
            // to prevent overflow when percents sum to exactly 100 and there is also a "*",
            // since this might not be expected.
            staticSize += (starCount * minSize);
        } else {
            // star sized items share the remaining percent size
            starPercent = (100 - percentTotal) / starCount;
            percentTotal = 100;
        }
    }

    if (percentTotal > 0) {
        // translate all "*" / "%" sized items to pixel sizes

        var remainingSpace = totalSize - staticSize,
            pixelsPerPercent = Math.max(0, remainingSpace / percentTotal),
            lastStretch = null;

        for (i = 0; i < sizes.length; i++) {
            size = sizes[i];

            if (isc.isA.String(size)) {
                var stretchSize;
                if (size == isc.star) {
                    stretchSize = starPercent * pixelsPerPercent;
                } else if (size.indexOf(this._$percent) >= 0) {

                    stretchSize = parseInt(size) * pixelsPerPercent;
                } else {
                    // the remaining case - a non-star non-percent string - was translated to
                    // a static size in the first pass (which will be zero if we didn't
                    // understand it)
                    continue;
                }
                stretchSize = Math.max(Math.floor(stretchSize), minSize);
                remainingSpace -= stretchSize;
                // NOTE: remember the last variable-sized item for later (to add leftover pixels)
                lastStretch = i;
                resultSizes[i] = stretchSize;
            }
        }
        // add any remaining pixels to the last stretch item
        if (remainingSpace > 0) resultSizes[lastStretch] += remainingSpace;
    }

    //>DEBUG
    if (logEnabled) {
        this.logDebug("stretchResize" + (propertyTarget ? " for " + propertyTarget.ID : "") +
                     " with totalSize: " + totalSize +
                     ",  desired sizes: " + sizes +
                     ",  calculated sizes: " + resultSizes, "listPolicy");
    }
    //<DEBUG

    // return the sizes array
    return resultSizes;
}

});    // END isc.Canvas.addMethods()








//> @class GroupingMessages
// Grouping titles that will be displayed when data is grouped
// in a +link{ListGrid}.
// @treeLocation Client Reference/Grids/ListGrid
// @visibility external
//<
isc.ClassFactory.defineClass("GroupingMessages");

isc.GroupingMessages.addClassProperties({
    //> @classAttr GroupingMessages.upcomingTodayTitle   (string : "Today" : IRW)
    // When a +link{ListGrid} is grouped by a date field in 'Upcoming' mode,
    // this is the group title for all records in which the grouped date field occurs today,
    // relative to the current date.
    //
    // @visibility external
    // @group i18nMessages
    //<
    upcomingTodayTitle: "Today",

    //> @classAttr GroupingMessages.upcomingTomorrowTitle   (string : "Tomorrow" : IRW)
    // When a +link{ListGrid} is grouped by a date field in 'Upcoming' mode,
    // this is the group title for all records in which the grouped date field occurs tomorrow,
    // relative to the current date.
    //
    // @visibility external
    // @group i18nMessages
    //<
    upcomingTomorrowTitle: "Tomorrow",

    //> @classAttr GroupingMessages.upcomingThisWeekTitle   (string : "This Week" : IRW)
    // When a +link{ListGrid} is grouped by a date field in 'Upcoming' mode,
    // this is the group title for all records in which the grouped date field occurs this week,
    // relative to the current date.
    //
    // @visibility external
    // @group i18nMessages
    //<
    upcomingThisWeekTitle: "This Week",

    //> @classAttr GroupingMessages.upcomingNextWeekTitle   (string : "Next Week" : IRW)
    // When a +link{ListGrid} is grouped by a date field in 'Upcoming' mode,
    // this is the group title for all records in which the grouped date field occurs next week,
    // relative to the current date.
    //
    // @visibility external
    // @group i18nMessages
    //<
    upcomingNextWeekTitle: "Next Week",

    //> @classAttr GroupingMessages.upcomingNextMonthTitle   (string : "Next Month" : IRW)
    // When a +link{ListGrid} is grouped by a date field in 'Upcoming' mode,
    // this is the group title for all records in which the grouped date field occurs next month,
    // relative to the current date.
    //
    // @visibility external
    // @group i18nMessages
    //<
    upcomingNextMonthTitle: "Next Month",

    //> @classAttr GroupingMessages.upcomingBeforeTitle   (string : "Before" : IRW)
    // When a +link{ListGrid} is grouped by a date field in 'Upcoming' mode,
    // this is the group title for all records in which the grouped date field occurs before
    // the current date.
    //
    // @visibility external
    // @group i18nMessages
    //<
    upcomingBeforeTitle: "Before",

    //> @classAttr GroupingMessages.upcomingLaterTitle   (string : "Later" : IRW)
    // When a +link{ListGrid} is grouped by a date field in 'Upcoming' mode,
    // this is the group title for all records in which the grouped date field occurs later than
    // one month after today's date.
    //
    // @visibility external
    // @group i18nMessages
    //<
    upcomingLaterTitle: "Later",

    // ----------------date constants----------------------------------------------------------

    //> @classAttr GroupingMessages.byDayTitle   (string : "by Day" : IRW)
    // Title to use for the menu option which groups a date field by day.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byDayTitle: "by Day",

    //> @classAttr GroupingMessages.byWeekTitle   (string : "by Week" : IRW)
    // Title to use for the menu option which groups a date field by week.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byWeekTitle: "by Week",

    //> @classAttr GroupingMessages.byMonthTitle   (string : "by Month" : IRW)
    // Title to use for the menu option which groups a date field by month.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byMonthTitle: "by Month",

    //> @classAttr GroupingMessages.byQuarterTitle   (string : "by Quarter" : IRW)
    // Title to use for the menu option which groups a date field by quarter.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byQuarterTitle: "by Quarter",

    //> @classAttr GroupingMessages.byYearTitle   (string : "by Year" : IRW)
    // Title to use for the menu option which groups a date field by year.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byYearTitle: "by Year",

    //> @classAttr GroupingMessages.byDayOfMonthTitle   (string : "by Day of Month" : IRW)
    // Title to use for the menu option which groups a date field by day of month.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byDayOfMonthTitle: "by Day of Month",

    //> @classAttr GroupingMessages.byUpcomingTitle   (string : "by Upcoming" : IRW)
    // Title to use for the menu option which groups a date field by upcoming dates.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byUpcomingTitle: "by Upcoming",

    // -------------time contants--------------------------------------------------------------

    //> @classAttr GroupingMessages.byHoursTitle   (string : "by Hours" : IRW)
    // Title to use for the menu option which groups a time field by hours.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byHoursTitle: "by Hours",

    //> @classAttr GroupingMessages.byMinutesTitle   (string : "by Minutes" : IRW)
    // Title to use for the menu option which groups a time field by minutes.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byMinutesTitle: "by Minutes",

    //> @classAttr GroupingMessages.bySecondsTitle   (string : "by Seconds" : IRW)
    // Title to use for the menu option which groups a time field by seconds.
    //
    // @visibility external
    // @group i18nMessages
    //<
    bySecondsTitle: "by Seconds",

    //> @classAttr GroupingMessages.byMillisecondsTitle   (string : "by Milliseconds" : IRW)
    // Title to use for the menu option which groups a time field by milliseconds.
    //
    // @visibility external
    // @group i18nMessages
    //<
    byMillisecondsTitle: "by Milliseconds",

    //> @classAttr GroupingMessages.weekNumberTitle   (string : "Week #" : IRW)
    // Title to use for the week number grouping mode
    //
    // @visibility external
    // @group i18nMessages
    //<
    weekNumberTitle: "Week #",

    //> @classAttr GroupingMessages.timezoneMinutesSuffix   (string : "minutes" : IRW)
    // Suffix to append to the timezoneMinutes grouping mode
    //
    // @visibility external
    // @group i18nMessages
    //<
    timezoneMinutesSuffix: "minutes",

    //> @classAttr GroupingMessages.timezoneSecondsSuffix   (string : "seconds" : IRW)
    // Suffix to append to the timezoneSeconds grouping mode
    //
    // @visibility external
    // @group i18nMessages
    //<
    timezoneSecondsSuffix: "seconds"
});

isc.builtinTypes =
{
    // basic types


    //any:{},
    text:{validators:{type:"isString", typeCastValidator:true}},
    "boolean":{validators:{type:"isBoolean", typeCastValidator:true}},
    integer:{validators:{type:"isInteger", typeCastValidator:true},
        normalDisplayFormatter : function (value, field) {
           if (isc.isA.Number(value)) return value.toFormattedString();
           return value;
        },
        getGroupValue : function(value, record, field, fieldName, grid) {
           var g = field.groupGranularity;
           return g ? Math.ceil(value / g) : value;
        },
        getGroupTitle : function(value, record, field, fieldName, grid) {
           // if the field is an integer and groupGranularity is set,
           // form the granularity string
           var g = field.groupGranularity;
           return g ? ((value - 1) * g) + " - " + (value * g) : value;
        }
    },
    "float":{validators:{type:"isFloat", typeCastValidator:true},
        normalDisplayFormatter : function (value, field) {
           if (isc.isA.Number(value)) return value.toFormattedString();
           return value;
        },
        getGroupValue : function(value, record, field, fieldName, grid) {
           // the field is a float and groupPrecision is set as positive integer
           field.groupPrecision = parseInt(field.groupPrecision);
           if (field.groupPrecision < 0) field.groupPrecision = field.groupPrecision * -1;
           var p = field.groupPrecision ? Math.pow(10, field.groupPrecision) : null;
           return p ? Math.floor(value * p) / p : value;
        },
        getGroupTitle : function(value, record, field, fieldName, grid) {
           // the field is a float type and groupPrecision is set
           // the return title should be appended with a *
           return field.groupPrecision ? value+"*" : value;
        }
    },
    date:{validators:{type:"isDate", typeCastValidator:true},
        normalDisplayFormatter : function (value, field) {
           if (isc.isA.Date(value)) return value.toNormalDate();
           return value;
        },
        getGroupingModes : function () {
            return {
                day: isc.GroupingMessages.byDayTitle,
                week: isc.GroupingMessages.byWeekTitle,
                month: isc.GroupingMessages.byMonthTitle,
                quarter:isc.GroupingMessages.byQuarterTitle,
                year:isc.GroupingMessages.byYearTitle,
                dayOfMonth:isc.GroupingMessages.byDayOfMonthTitle,
                upcoming:isc.GroupingMessages.byUpcomingTitle
            };
        },
        defaultGroupingMode : "day", //default grouping mode
        groupingMode : this.defaultGroupingMode,
        getGroupValue : function(value, record, field, fieldName, grid) {
           var returnValue=value;
           // if groupingMode is undefined, pick it up here from defaultGroupingMode
           var groupingMode = field.groupingMode =
                (field.groupingMode || field._simpleType.defaultGroupingMode || null);
           // the field is a date and groupingModes is set
           if (isc.isA.Date(value) && groupingMode) {
               // check all possible values in the form {identified : return string}
               // { week:"by week", month:"by month", year:"by year" }
               // { dayOfWeek:"by day of week", dayOfMonth:"by day of month" }
               // { timezoneHours:"by Timezone hours", timezoneMinutes:"by Timezone Minutes" }
               // { timezoneSeconds:"by Timezone Seconds" }
               // { default: { day:"by day" }
               switch (groupingMode) {
                   case "year":
                       returnValue = value.getFullYear();
                   break;
                   case "quarter":
                       returnValue = Math.floor(value.getMonth() / 3) + 1;
                   break;
                   case "month":
                       returnValue = value.getMonth();
                   break;
                   case "week":
                       returnValue = value.getWeek();
                   break;
                   case "day":
                   case "dayOfWeek":
                       returnValue = value.getDay();
                   break;
                   case "dayOfMonth":
                       returnValue = value.getDate();
                   break;
                   case "timezoneHours":
                       returnValue = value.getTimezoneOffset()/60;
                   break;
                   case "timezoneMinutes":
                       returnValue = value.getTimezoneOffset();
                   break;
                   case "timezoneSeconds":
                       returnValue = value.getTimezoneOffset()*60;
                   break;
                   case "upcoming":
                       var today = new Date();
                       if (today.isToday(value)) return 1;
                       else if (today.isTomorrow(value)) return 2;
                       else if (today.isThisWeek(value)) return 3;
                       else if (today.isNextWeek(value)) return 4;
                       else if (today.isNextMonth(value)) return 5;
                       else if (today.isBeforeToday(value)) return 7;
                       else return 6;
                   break;
               }
           }
           return returnValue;
        },
        getGroupTitle : function(value, record, field, fieldName, grid) {
           var returnValue=value;
           // if groupingMode is undefined, pick it up here from defaultGroupingMode
           var groupingMode = field.groupingMode =
                (field.groupingMode || field._simpleType.defaultGroupingMode || null);
           // the field is a date and groupingModes is set

           if (groupingMode && value != "-none-") {
               // check all possible values in the form {identified : return string}
               // { week:"by week", month:"by month", year:"by year" }
               // { dayOfWeek:"by day of week", dayOfMonth:"by day of month" }
               // { timezoneHours:"by Timezone hours", timezoneMinutes:"by Timezone Minutes" }
               // { timezoneSeconds:"by Timezone Seconds" }
               // { default: { day:"by day" }
               switch (groupingMode) {
                   case "month":
                       returnValue = Date.getShortMonthNames()[value];
                   break;
                   case "quarter":
                       returnValue = "Q" + value;
                   break;
                   case "week":
                       returnValue = isc.GroupingMessages.weekNumberTitle + value;
                   break;
                   case "day":
                   case "dayOfWeek":
                       returnValue = Date.getShortDayNames()[value];
                   break;
                   case "dayOfMonth":
                       returnValue = value;
                   break;
                   case "timezoneHours":
                       returnValue = "GMT+" + value;
                   break;
                   case "timezoneMinutes":
                       returnValue = "GMT+" + value + " " + isc.GroupingMessages.timezoneMinutesSuffix;
                   break;
                   case "timezoneSeconds":
                       returnValue = "GMT+" + value + " " + isc.GroupingMessages.timezoneSecondsSuffix;
                   break;
                   case "upcoming":
                       var today = new Date();
                       if (value == 1) return isc.GroupingMessages.upcomingTodayTitle;
                       else if (value == 2) return isc.GroupingMessages.upcomingTomorrowTitle;
                       else if (value == 3) return isc.GroupingMessages.upcomingThisWeekTitle;
                       else if (value == 4) return isc.GroupingMessages.upcomingNextWeekTitle;
                       else if (value == 5) return isc.GroupingMessages.upcomingNextMonthTitle;
                       else if (value == 7) return isc.GroupingMessages.upcomingBeforeTitle;
                       else return isc.GroupingMessages.upcomingLaterTitle;
                   break;
               }
           }
           return returnValue;
        }
    },
    time:{validators:{type:"isTime", typeCastValidator:true},
        normalDisplayFormatter : function (value, field) {
           if (isc.isA.Date(value)) return isc.Time.toTime(value, null, true);
           return value;
        },
        getGroupingModes : function () {
            return {
                hours:isc.GroupingMessages.byHoursTitle,
                minutes:isc.GroupingMessages.byMinutesTitle,
                seconds:isc.GroupingMessages.bySecondsTitle,
                milliseconds:isc.GroupingMessages.byMillisecondsTitle
            }
        },
        defaultGroupingMode : "hours", //default grouping mode
        groupingMode : this.defaultGroupingMode,
        getGroupValue : function(value, record, field, fieldName, grid) {
           var returnValue=value;
           // if groupingMode is undefined, pick it up here from defaultGroupingMode
           var groupingMode = field.groupingMode =
                (field.groupingMode || field._simpleType.defaultGroupingMode || null);
           // the field is a date and groupingModes is set
           if (isc.isA.Date(value) && groupingMode) {
               // check all possible values in the form {identified : return string}
               // { hours:"by Hours", minutes:"by Minutes", seconds:"by Seconds" }
               // { milliseconds:"by Milliseconds", }
               // { default: { hours:"by hours" }
               switch (groupingMode) {
                   case "hours":
                       returnValue = value.getHours();
                   break;
                   case "minutes":
                       returnValue = value.getMinutes();
                   break;
                   case "seconds":
                       returnValue = value.getSeconds();
                   break;
                   case "milliseconds":
                       returnValue = value.getMilliseconds();
                   break;
               }
           }
           return returnValue;
        },
        getGroupTitle : function(value, record, field, fieldName, grid) {
           var returnValue=value;
           var groupingMode = field.groupingMode || field._simpleType.defaultGroupingMode || null;
           // the field is a date and groupingModes is set
           if (groupingMode && value != "-none-") {
               // check all possible values in the form {identified : return string}
               // { hours:"by Hours", minutes:"by Minutes", seconds:"by Seconds" }
               // { milliseconds:"by Milliseconds", }
               // { default: { hours:"by hours" }
               switch (groupingMode) {
                   case "hours":
                   case "minutes":
                   case "seconds":
                   case "milliseconds":
                       returnValue = value;
                   break;
               }
           }
           return returnValue;
        }
    },

    // synonyms of basic types.  NOTE: must inheritFrom rather than duplicate base type
    // definitions, so that the equivalent of "instanceof" checks will detect them as
    // being of the same base type
    string:{inheritsFrom:"text"}, // XML Schema
    "int":{inheritsFrom:"integer"}, // XML Schema
    "long":{inheritsFrom:"integer"},
    number:{inheritsFrom:"integer"},
    decimal:{inheritsFrom:"float"}, // XML Schema
    "double":{inheritsFrom:"float"}, // XML Schema

    datetime:{inheritsFrom:"date", // XML Schema
        normalDisplayFormatter : function (value, field) {
           if (isc.isA.Date(value)) return value.toShortDateTime(null, true);
           return value;
        }
    },
    dateTime:{inheritsFrom:"datetime"},

    // derived types
    positiveInteger:{
        inheritsFrom:"integer",
        validators:{type:"integerRange", min:0}
    },
    integerPercent:{
        inheritsFrom:"integer",
        validators:{type:"integerRange", min:0, max:100}
    },
    percent:{inheritsFrom:"integerPercent"},
    sequence:{inheritsFrom:"integer"},
    "enum":{validators:"isOneOf"},
    "intEnum":{inheritsFrom:"integer",validators:"isOneOf"},
    regexp:{inheritsFrom:"text", validators:"isRegexp"},
    identifier:{inheritsFrom:"text", validators:"isIdentifier"},
    URL:{inheritsFrom:"text"},
    image:{inheritsFrom:"text"},
    HTML:{inheritsFrom:"text"},
    measure:{validators:"isMeasure"},
    integerOrAuto:{validators:"integerOrAuto"},
    expression:{inheritsFrom:"text"},
    method:{inheritsFrom:"text"},
    "function":{inheritsFrom:"text"},
    alignEnum:{
        inheritsFrom:"enum",
        valueMap:{left:"left", center:"center", right:"right"}
    },
    valignEnum:{
        inheritsFrom:"enum",
        valueMap:{top:"top", bottom:"bottom", center:"center"}
    },
    sideEnum:{
        inheritsFrom:"enum",
        valueMap:{left:"left", right:"right", top:"top", bottom:"bottom"}
    },
    color:{inheritsFrom:"string", validators:"isColor"},

    modifier: {inheritsFrom:"text", hidden: true, canEdit: false},
    modifierTimestamp: {inheritsFrom:"datetime", hidden: true, canEdit: false},
    creator: {inheritsFrom:"text", hidden: true, canEdit: false},
    creatorTimestamp: {inheritsFrom:"datetime", hidden: true, canEdit: false},
    password: {
        inheritsFrom:"text",
        normalDisplayFormatter : function (value, field) {
           return new Array((value && value.length > 0 ? value.length+1 : 0)).join("*");
        },
        shortDisplayFormatter : function (value, field) {
           return new Array((value && value.length > 0 ? value.length+1 : 0)).join("*");
        }
    },
    localeInt:{
        inheritsFrom:"integer",
        normalDisplayFormatter : function (value, field) {
            return isc.NumberUtil.toLocalizedString(value);
        },
        shortDisplayFormatter : function (value, field) {
            return isc.NumberUtil.toLocalizedString(value);
        }
    },
    localeFloat:{
        inheritsFrom:"float",
        normalDisplayFormatter : function (value, field) {
            return isc.NumberUtil.toLocalizedString(value, field.precision);
        },
        shortDisplayFormatter : function (value, field) {
            return isc.NumberUtil.toLocalizedString(value, field.precision);
        }
    },
    localeCurrency: {
        inheritsFrom:"decimal",
        normalDisplayFormatter : function (value, field) {
            return isc.NumberUtil.toCurrencyString(value);
        },
        shortDisplayFormatter : function (value, field) {
            return isc.NumberUtil.toCurrencyString(value);
        }
    }
};

(function () {

    for (var typeName in isc.builtinTypes) {
        isc.builtinTypes[typeName].name = typeName;
    }
})();

//> @class SimpleType
// An atomic type such as a string or number, that is generally stored, displayed and
// manipulated as a single value.
// <P>
// SimpleTypes can be created at any time, and subsequently referred to as a
// +link{dataSourceField.type,field type} in +link{DataSource,DataSources} and
// +link{DataBoundComponent,DataBoundComponents}.  This allows you to define
// +link{simpleType.validators,validation}, +link{simpleType.normalDisplayFormatter,formatting}
// and +link{simpleType.editorType,editing} behaviors for a type to be reused across all
// +link{DataBoundComponent,DataBoundComponents}.
// <P>
// The SimpleType class also allows data to be stored in some opaque format but treated as
// simple atomic values as far as SmartClient components are concerned by implementing
// +link{simpleType.getAtomicValue()} and +link{simpleType.updateAtomicValue()} methods.
// For example, if some record has a field value set to a javascript object with the
// following properties:
// <pre>
// { stringValue:"A String", length: 9 }
// </pre>
// this value could be treated as a simple string by defining a SimpleType with
// +link{simpleType.inheritsFrom} set to <code>"text"</code> and a custom
// <code>getAtomicValue()</code> method that simply extracted the <i>"stringValue"</i>
// attribute from the data object. DataBoundComponents would then display
// the string value, and use it for sorting and other standard databinding features.
// <P>
// Note that the term "simpleType" is used in the same sense as in
// +externalLink{XML Schema,http://www.w3.org/TR/xmlschema-0/}, and
// +link{XMLTools.loadXMLSchema()} will create new SimpleType definitions.
// <P>
// When using the SmartClient Server, SimpleTypes can be defined server-side, and should
// be defined server-side if validators are going to be declared so that the server will
// enforce validation. To define server-side SimpleTypes using Component XML you should create
// file {typeName}.type.xml in the following format:
// <pre>
//   &lt;SimpleType name="{typeName}" inheritsFrom="{otherSimpleType}"
//                  editorType="{FormItemClassName}"&gt;
//     &lt;validators&gt;
//       &lt;!-- validator definition just like DataSourceField --&gt;
//     &lt;/validators&gt;
//   &lt;/SimpleType&gt;
// </pre>
// .. and place this file alongside your DataSource files (.ds.xml) files - in any of folders
// listed in <code>project.datasources</code> property in +link{server_properties,server.properties}.
// <P>
// SimpleTypes can be loaded via DataSourceLoader or +link{group:loadDSTag,loadDS JSP tags} and
// should be loaded <b>before</b> the definitions of any DataSources that use them (so
// generally put all SimpleType definitions first).
// <P>
// Define validators in the server-side type definition, for example:
// <pre>
//   &lt;SimpleType name="countryCodeType" inheritsFrom="text"&gt;
//     &lt;validators&gt;
//       &lt;validator type="lengthRange" min="2" max="2"
//         errorMessage="Length of country code should be equals to 2." /&gt;
//       &lt;validator type="regexp" expression="[A-Z][A-Z]"
//         errorMessage="CountryCode should have only uppercase letters." /&gt;
//     &lt;/validators&gt;
//   &lt;/SimpleType&gt;
// </pre>
// <P>
// For client-side formatters, add these to the type definition after loading it from the
// server, for example:
// <var class="smartclient">
//   <pre>
//     isc.SimpleType.getType("independenceDateType").addProperties({
//         normalDisplayFormatter : function (value) {
//             if (value == null) return "";
//             return "&lt;i&gt;" + (value.getYear() + 1900) + "&lt;/i&gt;";
//         }
//     });
//   </pre>
// </var>
// <var class="smartgwt">
//   <pre>
//     SimpleType.getType("independenceDateType").setShortDisplayFormatter(new SimpleTypeFormatter() {
//       public String format(Object value, DataClass field, DataBoundComponent component, Record record) {
//         if (value == null) return null;
//         return "&lt;i&gt;" + (((java.util.Date) value).getYear() + 1900) + "&lt;/i&gt;";
//       }
//     });
//   </pre>
// </var>
// Note that formatters must be added to the SimpleType definition <b>before</b> any
// DataBoundComponent binds to a DataSource that uses the SimpleType.
// <p>
// An +explorerExample{formsCustomSimpleType,example} is here.
//
// @treeLocation Client Reference/Data Binding
// @serverDS allowed
// @visibility external
// @example extCustomSimpleType
//<

isc.defineClass("SimpleType");

isc.SimpleType.addClassMethods({

    //> @attr simpleType.name (identifier : null : IR)
    // Name of the type, used to refer to the type from +link{DataSourceField.type,field.type}.
    // @serverDS allowed
    // @visibility external
    //<

    //> @attr simpleType.inheritsFrom (identifier : null : IR)
    // Name of another SimpleType from which this type should inherit.
    // <P>
    // Validators, if any, will be combined.  All other SimpleType properties default to the
    // inherited type's value.
    //
    // @serverDS allowed
    // @visibility external
    // @example extCustomSimpleType
    //<

    //> @attr simpleType.validators (Array of Validator : null : IR)
    // Validators to apply to value of this type.
    //
    // @group validation
    // @serverDS allowed
    // @visibility external
    //<

    //> @attr simpleType.valueMap (ValueMap : null : IR)
    // List of legal values for this type, like +link{DataSourceField.valueMap}.
    //
    // @group dataType
    // @serverDS allowed
    // @visibility external
    //<

    //> @attr simpleType.editorType (FormItem ClassName : null : IR)
    // Classname of the FormItem that should be the default for editing values of this type (eg
    // "SelectItem").
    // <P>
    // You can create a simple custom FormItem by adding default +link{FormItem.icons} that
    // launch custom value picking dialogs (an example is in the <i>QuickStart
    // Guide</i>, Chapter 9, <i>Extending SmartClient</i>).  By setting simpleType.editorType
    // to the name of your custom FormItem, forms will automatically use the custom FormItem,
    // as will grids performing +link{listGrid.canEdit,inline editing}.
    //
    // @serverDS allowed
    // @visibility external
    //<


    //> @attr simpleType.readOnlyEditorType (FormItem ClassName : null : IR)
    // Classname of the FormItem that should be used to display values of this type when a field
    // is marked as +link{DataSourceField.canEdit,canEdit false} and the field is displayed
    // in an editor type component like a DynamicForm.
    // <P>
    // May be overridden by +link{DataSourceField.readOnlyEditorType}.
    //
    // @serverDS allowed
    // @visibility external
    //<

    //> @attr simpleType.fieldProperties (DataSourceField Properties : null : IR)
    // These are properties that are essentially copied onto any DataSourceField where the
    // property is applied. The supported properties are only client-side properties.
    //
    // @visibility external
    //<

    //> @method simpleType.getAtomicValue()
    // Optional method to extract an atomic value (such as a string or number)
    // from some arbitrary live data value. If defined this method will be called
    // for every field value of the specified type in order to convert from the
    // raw data value to an atomic type to be used for standard DataBinding features
    // such as sorting and editing.
    // @param value (any) Raw data value to convert. Typically this would be a field
    //   value for some record.
    // @return (any) Atomic value. This should match the underlying atomic type
    //   specified by the +link{SimpleType.inheritsFrom} attribute.
    // @visibility external
    //<

    //> @method simpleType.updateAtomicValue()
    // Optional method to update a live data value with an edited atomic value
    // (such as a string or number). If defined this method will be called
    // when the user edits data in a field of this type, allowing the developer
    // to convert from the atomic type to a raw data value for storage.
    // <P>
    // Note that if the user is editing a field which did not previously have a value, the
    // 'currentValue' will be null. This method should handle this (creating a new data value).
    //
    // @param atomicValue (any) New atomic value. This should match the underlying
    //  atomic type specified by the +link{SimpleType.inheritsFrom} attribute.
    // @param currentValue (any) Existing data value to be updated.
    // @return (any) Updated data value.
    // @visibility external
    //<

    //> @method simpleType.shortDisplayFormatter()
    // Formatter for values of this type when compact display is required, for example, in a
    // +link{ListGrid} or +link{TreeGrid}.
    // <P>
    // When this formatter is called, the SimpleType object is available as "this".
    // <P>
    // A formatter can make itself configurable on a per-component or per-field basis by
    // checking properties on the component or field.  For example, a formatter for account IDs
    // may want to omit a prefix in views where it is redundant, and could check a flag
    // listGridField.omitAccountIdPrefix for this purpose.
    //
    // @param value (any) value to be formatted
    // @param [field] (Field) field descriptor from the component calling the formatter, if
    //                      applicable.  Depending on the calling component, this could be a
    //                      +link{ListGridField}, +link{TreeGridField}, etc
    // @param [component] (DataBoundComponent) component calling this formatter, if applicable
    // @param [record] (Object) Full record, if applicable
    //
    // @serverDS allowed
    // @visibility external
    //<

    //> @method simpleType.normalDisplayFormatter()
    // Normal formatter for values of this type used in a +link{StaticTextItem} or
    // +link{DetailViewer}.
    // <P>
    // When this formatter is called, the SimpleType object is available as "this".
    // <P>
    // A formatter can make itself configurable on a per-component or per-field basis by
    // checking properties on the component or field.  For example, a formatter for account IDs
    // may want to omit a prefix in views where it is redundant, and could check a flag
    // detailViewer.omitAccountIdPrefix for this purpose.
    //
    // @param value (any) value to be formatted
    // @param [field] (Field) field descriptor from the component calling the formatter, if
    //                      applicable.  Depending on the calling component, this could be a
    //                      +link{FormItem}, +link{DetailViewerField}, etc
    // @param [component] (DataBoundComponent) component calling this formatter, if applicable
    // @param [record] (Object) Full record, if applicable
    //
    // @serverDS allowed
    // @visibility external
    //<

    //> @method simpleType.editFormatter()
    // Formatter for values of this type when displayed in a freeform text editor, such as
    // a +link{TextItem}.
    // <P>
    // See also +link{simpleType.parseInput()} for parsing an edited text value back to
    // a data value.
    // @param value (any) value to be formatted
    // @param [field] (FormItem) Editor for this field
    // @param [form] (DynamicForm) DynamicForm containing this editor
    // @param [record] (Record) Current edit values for this record, as displayed in
    //      the edit component.
    //
    // @return (string) formatted value
    //
    // @visibility external
    //<

    //> @method simpleType.parseInput()
    // Parser to convert some user-edited value to an underlying data value of this type.
    // This parser is called when storing out values edited in a freeform editor such as
    // a +link{TextItem}. Typically this will convert from the format produced by
    // +link{simpleType.editFormatter} back to a data value.
    //
    // @param value (String) edited value provided by the user
    // @param [field] (FormItem) Editor for this field
    // @param [form] (DynamicForm) DynamicForm containing this editor
    // @param [record] (Record) Current edit values for this record, as displayed in
    //      the edit component.
    //
    // @return (any) data value derived from display string passed in.
    //
    // @visibility external
    //<

    //> @classMethod SimpleType.getType()
    // Retrieve a simpleType definition by type name
    // @param typeName (string) the <code>name</code> of the simpleType to return
    // @return (SimpleType) simple type object
    // @visibility external
    //<
    getType : function (typeName, ds) {
        // respect local types (dataSource.getType() calls us back, but without passing itself)
        if (ds) return ds.getType(typeName);

        var type = isc.builtinTypes[typeName];
        return type;
    },



    // get the type this typeName or type definition inherits from
    getBaseType : function (type, ds) {
        if (isc.isA.String(type)) type = this.getType(type, ds);
        if (type == null) return null; // return null for being passed null and for
                                       // non-existent types
        while (type.inheritsFrom) {
            var parentType = this.getType(type.inheritsFrom, ds);
            if (parentType == null) return null; // no such parentType
            type = parentType;
        }
        return type.name;
    },

    // determine whether one type inherits from another
    inheritsFrom : function (type, otherType, ds) {
        if (otherType == null) {
            this.logWarn("inheritsFrom passed null type");
            return false;
        }
        if (isc.isA.String(type)) type = this.getType(type, ds);
        if (type == null) return false; // return false for non-existent types

        if (type.name == otherType) return true;
        while (type.inheritsFrom) {
            var parentType = this.getType(type.inheritsFrom, ds);
            if (parentType == null) return null; // no such parentType
            if (parentType.name == otherType) return true;
            type = parentType;
        }
        return false;
    },

    // validate a value of simple type
    validateValue : function (type, value, ds) {

        var field = { name:"_temp", type:type };
        isc.SimpleType.addTypeDefaults(field);
        var ds = ds || isc.DS.get("Object");
        return ds.validateFieldValue(field, value);
    },

    // add the type defaults to a field, once ever per field.
    // Happens to DataSources fields when fields are first accessed for the DataSource.
    // Happens to component.fields *which don't have a DataSource field* during DataSource
    // binding.  Otherwise, copied from DataSource fields like other properties.
    addTypeDefaults : function (field, ds) {

        if (field == null || field._typeDefaultsAdded) return;
        field._typeDefaultsAdded = true; // should only ever happen once per field

        // get the type definition, looking for locally defined type if a DataSource is passed
        // in
        var type = this.getType(field.type, ds);
        if (type == null) return;

        // hang the type definition itself on the field, since when formatters are called, they
        // need to be invoked on the type
        field._simpleType = type;

        // add the valueMap to the field
        if (field.valueMap == null) {
            var valueMap = this.getInheritedProperty(type, "valueMap", ds);
            if (valueMap != null) type.valueMap = field.valueMap = valueMap;
        }

        if (field.editorType == null) {
            var editorType = this.getInheritedProperty(type, "editorType", ds);
            if (editorType != null) type.editorType = field.editorType = editorType;
        }

        if (field.readOnlyEditorType == null) {
            var editorType = this.getInheritedProperty(type, "readOnlyEditorType", ds);
            if (editorType != null) type.readOnlyEditorType = field.readOnlyEditorType = editorType;
        }


        var editorProps = this.getInheritedProperty(type, "editorProperties", ds);
        if (editorProps != null) {
            // If defined at the field level as well, combine the objects
            if (field.editorProperties != null) {
                field.editorProperties = isc.addProperties({}, editorProps, field.editorProperties);
            } else {
                field.editorProperties = isc.addProperties({}, editorProps);
            }
        }

        var readOnlyEditorProps = this.getInheritedProperty(type, "readOnlyEditorProperties", ds);
        if (readOnlyEditorProps != null) {
            // If defined at the field level as well, combine the objects
            if (field.readOnlyEditorProperties != null) {
                isc.addProperties(readOnlyEditorProps, field.readOnlyEditorProperties);
            }
            field.readOnlyEditorProperties = readOnlyEditorProps;
        }

        // add formatters / parsers

        var formatter = this.getInheritedProperty(type, "shortDisplayFormatter", ds)
        if (formatter != null) type.shortDisplayFormatter = field._shortDisplayFormatter = formatter;
        var formatter = this.getInheritedProperty(type, "normalDisplayFormatter", ds)
        if (formatter != null) type.normalDisplayFormatter = field._normalDisplayFormatter = formatter;
        // these aren't documented yet because they only get called by inline editing, not
        // normal forms
        var formatter = this.getInheritedProperty(type, "editFormatter", ds)
        if (formatter != null) type.editFormatter = field._editFormatter = formatter;
        var parser = this.getInheritedProperty(type, "parseInput", ds)
        if (parser != null) type.parseInput = field._parseInput = parser;

        // add validators
        var typeValidators = this.getValidators(type, ds);
        if (typeValidators == null) return;

        if (!field.validators) {

            field.validators = typeValidators;
        } else {
            // there are both field validators and type validators
            if (!isc.isAn.Array(field.validators)) field.validators = [field.validators];
            field.validators.addAsList(typeValidators);
            this._reorderTypeValidator(field.validators);
        }
    },

    // get a property that can be defined in this type, or any type this type inherits from
    getInheritedProperty : function (type, propertyName, ds) {
        while (type != null) {
            if (type[propertyName] != null) return type[propertyName]
            type = this.getType(type.inheritsFrom, ds);
        }
    },

    // return all validators for the given type (can be the name or the type definition), taking
    // inheritance into account

    getValidators : function (type, ds) {
        if (isc.isA.String(type)) type = this.getType(type, ds);

        // _normalized flag indicates we've already made sure the "validators" Array is in the
        // canconical Array of Objects format
        if (type._normalized) return type.validators;

        var validators = type.validators;

        if (validators != null) {
            // handle validators expressed as a single string or object
            if (!isc.isAn.Array(validators)) validators = [validators];

            var normalizedValidators = [];
            // if any of the validators are strings, replace them with validator objects,
            // setting the type to the string
            for (var i = 0; i < validators.length; i++) {
                var validator = validators[i];
                if (isc.isA.String(validator)) {
                    validator = {"type":validator};

                } else if (validator.type == null && isc.isAn.emptyObject(validator)) {
                    continue;
                }
                validator._generated = true;
                normalizedValidators.add(validator);
            }
            validators = normalizedValidators;
        }

        // lookup the parent type's validators and combine
        var parentTypeID = type.inheritsFrom;
        if (parentTypeID != null) {
            var parentType = this.getType(parentTypeID, ds);
            if (parentType != null) {
                var parentValidators = this.getValidators(parentType, ds);
                if (parentValidators != null) {
                    validators = validators || [];
                    // NOTE: this intentionally places the subType's validators first, to allow
                    // error message overrides
                    validators.addAsList(parentValidators);
                    this._reorderTypeValidator(validators);
                }
            }
        }

        // flag this Array of validators as the default for the type
        if (validators) validators._typeValidators = true;

        // store the normalized and combined validators
        type.validators = validators;
        type._normalized = true;
        return validators;
    },
    _$typeCastValidator:"typeCastValidator",
    _reorderTypeValidator : function (validators) {


        //this.logWarn("validators are: " + this.echoAll(validators));

        // find the typeCast validator to determine the basic type this field inherits from
        // (equivalent to looking up the base type given the field type)
        var castValidator = validators.find(this._$typeCastValidator, true);
        if (castValidator) {
            // look for the most recent declaration of the basic type validator, in order to
            // support redeclaration of the type validator with a custom error message, eg
            // { type:"isDate", errorMessage:"customMessage" }
            var castType = castValidator.type;
            //this.logWarn("cast validator is type: " + castType);
            for (var i = 0; i < validators.length; i++) {
                if (validators[i].type == castType) break;
            }

            // promote the most recent declaration of the basic type validator so that it will
            // run first, so subsequent validators don't have to check type

            //this.logWarn("moving validator to front: " + this.echo(validators[i]));
            if (i != 0) validators.unshift(validators[i]);
            validators[0].stopIfFalse = true;
        }
    },

    // -------------------------------------------------------------------------------
    // summary functions

    //> @type SummaryFunction
    // Function to produce a summary value based on an array of records and a field definition.
    // An example usage is the +link{listGrid.showGridSummary,listGrid summary row}, where
    // a row is shown at the bottom of the listGrid containing summary information about each
    // column.
    // <P>
    // SummaryFunctions may be specified in one of 2 ways:<ul>
    // <li>as an explicit function or executable
    // +link{type:stringMethod}, which will be passed <code>records</code> (an array of records)
    // and <code>field</code> (the field definition for which the summary is required).</li>
    // <li>as a standard SummaryFunction identifier</li></ul>
    //
    // @value sum Iterates through the set of records, picking up and summing all numeric values
    // for the specified field. Returns null to indicate invalid summary value if
    // any non numeric field values are encountered.
    // @value avg Iterates through the set of records, picking up all numeric values
    // for the specified field and determining the mean value. Returns null to indicate invalid
    // summary value if any non numeric field values are encountered.
    // @value max Iterates through the set of records, picking up all values
    // for the specified field and finding the maximum value. Handles numeric fields and
    // date type fields only. Returns null to indicate invalid
    // summary value if any non numeric/date field values are encountered.
    // @value min Iterates through the set of records, picking up all values
    // for the specified field and finding the minimum value.  Handles numeric fields and
    // date type fields only. Returns null to indicate invalid summary value if
    // any non numeric field values are encountered.
    // @value multiplier Iterates through the set of records, picking up all numeric values
    // for the specified field and multiplying them together.
    // Returns null to indicate invalid summary value if
    // any non numeric field values are encountered.
    // @value count Returns a numeric count of the total number of records passed in.
    // @value title Returns <code>field.summaryValueTitle</code> if specified, otherwise
    // <code>field.title</code>
    //
    // @visibility external
    //<

    // set up default registered summary functions (documented above)
    _registeredSummaryFunctions:{

      title : function (record, field) {
            if (field.summaryValueTitle != null) return field.summaryValueTitle;
            return field.title;
      },

      // Note that we use the undocumented 'component' param so _getFieldValue() can
      // handle cases where a field's dataPath is "absolute"
      sum : function (records, field, component) {
            var total = 0;
            for (var i = 0; i < records.length; i++) {
                var value = isc.Canvas._getFieldValue(null, field, records[i], component, true),
                    floatVal = parseFloat(value);

                if (value == null || value === isc.emptyString) continue;

                if (isc.isA.Number(floatVal) && (floatVal == value)) {
                    total += floatVal;
                } else {

                    if (component) {
                        // its a formula/summary field, ignore if showing the bad formula value
                        if ((field.userFormula || field.userSummary) &&
                                value == component.badFormulaResultValue) continue
                        if (value == component.invalidSummaryValue) continue;
                    }
                    return null;
                }
            }
            return total;
        },

        avg : function (records, field, component) {
            var total = 0, count=0;
            for (var i = 0; i < records.length; i++) {
                var value = isc.Canvas._getFieldValue(null, field, records[i], component, true),
                    floatVal = parseFloat(value);
                if (value == null || value === isc.emptyString) continue;

                if (isc.isA.Number(floatVal) && (floatVal == value)) {
                    count += 1;
                    total += floatVal;
                } else {

                    if (component) {
                        // its a formula/summary field, ignore if showing the bad formula value
                        if ((field.userFormula || field.userSummary) &&
                                value == component.badFormulaResultValue) continue
                        if (value == component.invalidSummaryValue) continue;
                    }
                    return null;
                }
            }
            return count > 0 ? total/count : null;
        },

        max : function (records, field, component) {

            var dateCompare = (field && (field.type == "date"));
            var max;
            for (var i = 0; i < records.length; i++) {
                var value = isc.Canvas._getFieldValue(null, field, records[i], component, true);
                if (value == null || value === isc.emptyString) continue;

                if (dateCompare) {
                    if (!isc.isA.Date(value)) return null;
                    if (max == null || value.getTime() > max.getTime()) max = value.duplicate();
                } else {
                    var floatVal = parseFloat(value);

                    if (isc.isA.Number(floatVal) && (floatVal == value)) {
                        if (max == null) max = floatVal;
                        else if (max < value) max = floatVal;
                    } else {

                        if (component) {
                            // its a formula/summary field, ignore if showing the bad formula value
                            if ((field.userFormula || field.userSummary) &&
                                    value == component.badFormulaResultValue) continue
                            if (value == component.invalidSummaryValue) continue;
                        }
                        return null;
                    }
                }
            }
            return max;
        },
        min : function (records, field, component) {
            var dateCompare = (field.type == "date")
            var min;
            for (var i = 0; i < records.length; i++) {
                var value = isc.Canvas._getFieldValue(null, field, records[i], component, true);
                if (value == null || value === isc.emptyString) continue;

                if (dateCompare) {
                    if (!isc.isA.Date(value)) return null;
                    if (min == null || value.getTime() < min.getTime()) min = value.duplicate();
                } else {
                    var floatVal = parseFloat(value);
                    if (isc.isA.Number(floatVal) && (floatVal == value)) {
                        if (min == null) min = floatVal;
                        else if (min > value) min = floatVal;
                    } else {

                        if (component) {
                            // its a formula/summary field, ignore if showing the bad formula value
                            if ((field.userFormula || field.userSummary) &&
                                    value == component.badFormulaResultValue) continue
                            if (value == component.invalidSummaryValue) continue;
                        }
                        return null;
                    }
                }
            }
            return min;
        },
        multiplier : function (records, field, component) {
            var multiplier = 0;
            for (var i = 0; i < records.length; i++) {
                var value = isc.Canvas._getFieldValue(null, field, records[i], component, true);

                var floatVal = parseFloat(value);
                if (isc.isA.Number(floatVal) && (floatVal == value)) {
                    if (i == 0) multiplier = floatVal;
                    else multiplier = (multiplier * floatVal);
                } else {
                    return null;
                }
            }
            return multiplier;
        },
        count : function (records, field) {
            return records.length;
        }

    },

    //> @classMethod SimpleType.registerSummaryFunction()
    // Registers a new +link{type:summaryFunction} by name. After calling this method,
    // developers may specify the name passed in as a standard summaryFunction
    // (for example in +link{listGridField.summaryFunction}).
    // @param functionName (string) name for the newly registered summaryFunction
    // @param method (function) New summary function. This function should take 2 parameters
    // <ul>
    //  <li><code>records</code>: an array of records for which a summary must be generated</li>
    //  <li><code>field</code>: a field definition - and return a summary value for the field</li>
    // </ul>
    // @visibility external
    //<
    // Note that the function actually takes a third param "displayComponent".
    // We use this to handle resolving fields with an "absolute" dataPath specified (where the
    // field dataPath reiterates the widget dataPath so we have to strip off the widget-dataPath
    // before drilling into the record to get the value).
    // This is undocumented to simplify backcompat.
    registerSummaryFunction : function (functionName, method) {

        if (functionName == null) return;
        // handle being passed a stringMethod
        if (isc.isA.String(method)) {
             method = isc.Func.expressionToFunction("records,field,displayComponent", functionName);
        }
        this._registeredSummaryFunctions[functionName] = method;
    },

    //> @classMethod SimpleType.setDefaultSummaryFunction()
    // Set up a default summary function for some field type.
    // <P>
    // Note that the following default summary functions are set up when SmartClient initializes:
    // <br>- <code>"integer"</code> defaults to <code>"sum"</code>
    // <br>- <code>"float"</code> defaults to <code>"sum"</code>.
    //
    // @param typeName (string) type name
    // @param summaryFunction (SummaryFunction) summary function to set as the default for
    //   this data type.
    // @visibility external
    //<
    setDefaultSummaryFunction : function (type, summaryFunction) {
        var typeObj = this.getType(type);
        if (typeObj) typeObj._defaultSummaryFunction = summaryFunction;
    },

    //> @classMethod SimpleType.getDefaultSummaryFunction()
    // Retrieves the default summary function for some field type.
    // @param typeName (string) type name
    // @return (SummaryFunction) default summary function for this data type.
    // @visibility external
    //<
    getDefaultSummaryFunction : function (type) {
        var typeObj = this.getType(type);
        if (typeObj) {
            if (typeObj._defaultSummaryFunction != null) {
                return typeObj._defaultSummaryFunction;
            }
            if (typeObj.inheritsFrom != null && typeObj.inheritsFrom != type) {
                return this.getDefaultSummaryFunction(typeObj.inheritsFrom);
            }
        }
    },

    //> @classMethod SimpleType.applySummaryFunction()
    // Applies a +link{type:SummaryFunction} to an array of records
    // @param records (Array of Objects) set of records to retrieve a summary value for
    // @param field (DataSourceField) field for which we're picking up a summary value
    // @param summaryFunction (SummaryFunction) SummaryFunction to apply to the records
    //  in order to retrieve the summary value. May be specified as an explicit function
    //  or string of script to execute, or a SummaryFunction identifier
    // @return (any) summary value generated from the applied SummaryFunction
    // @visibility external
    //<
    // Additional undocumented 'displayComponent' param is there to handle the case where
    // a field has an "absolute" dataPath and we need to strip off the component level dataPath
    // in order to get a path relative to the actual records.
    // Undocumented - we didn't want to complicate back-compat and for custom summary functions
    // the developer can always hang onto the ListGrid via closure or something similar.
    applySummaryFunction : function (records, field, summaryFunction, displayComponent) {
        if (!summaryFunction || !field || !records) return;

        // convert to an actual method to execute if necessary
        if (isc.isA.String(summaryFunction)) {
            if (this._registeredSummaryFunctions[summaryFunction]) {
                summaryFunction = this._registeredSummaryFunctions[summaryFunction];
            } else {
                summaryFunction = isc.Func.expressionToFunction("records,field,displayComponent", summaryFunction);
            }
        }
        if (isc.isA.Function(summaryFunction)) {
            return summaryFunction(records,field,displayComponent);
        }
    }

});

// these are documented in setDefaultSummaryFunction
isc.SimpleType.setDefaultSummaryFunction("integer", "sum");
isc.SimpleType.setDefaultSummaryFunction("float", "sum");

isc.SimpleType.addMethods({
    init : function () {
        // anonymous type; really only occurs validly with xsd:list and xsd:union, otherwise
        // anonymous types are just rolled into a DataSourceField definition and never create a
        // SimpleType as such
        if (!this.name) this.name = isc.ClassFactory.getNextGlobalID(this);

        if (isc.builtinTypes[this.name] != null) {
            // clobber existing types, but not if the new type came from XML Schema (and hence
            // is namespaced and still available via the SchemaSet)
            if (!this.xmlSource) {
                this.logWarn("SimpleType '" + this.name + "' defined twice: " +
                             this.getStackTrace());
                isc.builtinTypes[this.name] = this;
            }
        } else {
            isc.builtinTypes[this.name] = this;
        }

        // If validOperators is set, register it with isc.DataSource
        if (this.validOperators != null) {
            isc.DataSource.setTypeOperators(this.name, this.validOperators);
        }
    }
});


isc.SimpleType.getPrototype().toString = function () {
    return "[" + this.Class + " name=" + this.name +
        (this.inheritsFrom ? " inheritsFrom=" + this.inheritsFrom : "") + "]";
};


//> @class NavigationButton extends Button
// Specially styled Button subclass used by the +link{NavigationBar} class.
// @visibility external
// @treeLocation Client Reference/Layout/NavigationBar
//<
isc.defineClass("NavigationButton", "Button");

isc.NavigationButton.addProperties({
    height: 30,
    autoFit: true,

    //> @attr navigationButton.baseStyle (CSSStyleName : "navButton" : IRW)
    // Default baseStyle for navigation buttons. Note that the special +link{backBaseStyle} and
    // +link{forwardBaseStyle} are applied if +link{navigationButton.direction} is set.
    // @visibility external
    //<
    baseStyle: "navButton",

    //> @attr navigationButton.backBaseStyle (CSSStyleName : "navBackButton" : IRW)
    // Base style for navigation buttons where +link{direction} is set to <code>"back"</code>
    // @visibility external
    //<
    backBaseStyle: "navBackButton",

    //> @attr navigationButton.forwardBaseStyle (CSSStyleName : "navForwardButton" : IRW)
    // Base style for navigation buttons where +link{direction} is set to <code>"forward"</code>
    // @visibility external
    //<
    forwardBaseStyle: "navForwardButton",

    //>    @type    NavigationDirection
    // Navigation direction.
    // @value "back" Back
    // @value "forward" Forward
    // @value "none" none
    //
    // @visibility external
    //<

    //> @attr navigationButton.direction (NavigationDirection : "none" : IRW)
    // Navigation direction for this button. If set to <code>"forward"</code> or
    // <code>"back"</code> the special +link{forwardBaseStyle} or +link{backBaseStyle}
    // will be applied.
    //
    // @visibility external
    //<
    direction: "none",


    initWidget : function () {
        this.setBaseStyle(this.getBaseStyleName());
    },

    setNavigationDirection : function (direction) {
        this.direction = direction;
        this.setBaseStyle(this.getBaseStyleName());
    },

    getNavigationDirection : function () {
        return this.direction;
    },

    getBaseStyleName : function () {
        if (this.direction == "back") {
            return this.backBaseStyle;
        }
        if (this.direction == "forward") {
            return this.forwardBaseStyle;
        }
        return this.baseStyle;
    }

});


//> @class NavigationBar extends HLayout
// Navigation control implemented as a horizontal layout showing back and forward controls
// and a title.
// @visibility external
// @treeLocation Client Reference/Layout
//<
isc.defineClass("NavigationBar", "HLayout");

isc.NavigationBar.addProperties({
    width: "100%",
    height: 44,
    styleName:"navToolbar",

    //> @attr navigationBar.leftButtonTitle (String : "&nbsp;" : IRW)
    // +link{Button.title,Title} for the +link{leftButton}
    // @visibility external
    //<
    leftButtonTitle:"&nbsp;",

    //> @attr navigationBar.leftButtonIcon (SCImgURL : null : IRW)
    // +link{button.icon,Icon} for the +link{leftButton}
    // @visibility external
    //<

    //> @attr navigationBar.leftButton (AutoChild NavigationButton : null : IR)
    // The button displayed to the left of the title in this NavigationBar. By default this
    // will be a +link{NavigationButton} with +link{navigationButton.direction,direction} set
    // to <code>"back"</code>.
    //
    // @visibility external
    //<
    leftButtonDefaults: {
        _constructor: "NavigationButton",
        direction: "back",
        layoutAlign: "center"
    },

    //> @attr navigationBar.title (String : null : IRW)
    // The title to display centered in this NavigationBar
    //
    // @visibility external
    //<

    //> @attr navigationBar.titleLabel (AutoChild Label : null : IR)
    // The AutoChild label used to display the +link{navigationBar.title, title} in this
    // NavigationBar.
    //
    // @visibility external
    //<
    titleLabelDefaults: {
        _constructor: "Label",
        width: "*",
        styleName:"navBarHeader",
        align: "center",
        valign: "center"
    },

    //> @attr navigationBar.rightButtonTitle (String : "&nbsp;" : IRW)
    // +link{Button.title,Title} for the +link{rightButton}
    // @visibility external
    //<
    rightButtonTitle:"&nbsp;",

    //> @attr navigationBar.rightButtonIcon (SCImgURL : null : IRW)
    // +link{button.icon,Icon} for the +link{rightButton}
    // @visibility external
    //<

    //> @attr navigationBar.rightButton (AutoChild NavigationButton : null : IR)
    // The button displayed to the right of the title in this NavigationBar. By default this
    // will be a +link{NavigationButton} with +link{navigationButton.direction,direction} set
    // to <code>"forward"</code>.
    //
    // @visibility external
    //<
    rightButtonDefaults: {
        _constructor: "NavigationButton",
        direction: "forward",
        layoutAlign: "center"
    },
    showRightButton:false,

    autoChildren: ["leftButton", "titleLabel", "rightButton"],

    //> @attr navigationBar.controls (Array of string or canvas : null : IRW)
    // Controls to show in the navigation bar. The auto children names
    // "leftButton", "titleLabel", "rightButton" may be used to show the standard
    // navigation bar controls, as well as any Canvases (which will be embedded directly
    // in the navigation bar).
    // @visibility internal
    //<
    // When we expose this we'll also need to update SGWT wrapper code to handle it
    controls:["leftButton", "titleLabel", "rightButton"],

    //> @method navigationBar.setControls()
    // Setter to update the set of displayed +link{navigationBar.controls} at runtime.
    // @param controls (Array of string or canvas)
    // @visibility internal
    //<
    setControls : function (controls) {
        this.controls = controls;
        var members = [];
        for (var i = 0; i < controls.length; i++) {
            var control = controls[i];
            // translate from autoChild name to live autoChild widget
            if (isc.isA.String(control)) control = this[control];
            members[i] = control;
        }
        this.setMembers(members);
    },

    initWidget : function () {
        this.Super("initWidget", arguments);

        var leftButtonDefaults = {
            click:function () {
                if (this.creator.navigationClick) this.creator.navigationClick(this.direction);
            }
        };
        if (this.leftButtonTitle != null) leftButtonDefaults.title = this.leftButtonTitle;
        if (this.leftButtonIcon != null) leftButtonDefaults.icon = this.leftButtonIcon;

        this.leftButton = this.createAutoChild("leftButton", leftButtonDefaults);
        this.setShowLeftButton(this.showLeftButton != false);

        this.titleLabel = this.createAutoChild("titleLabel", { contents: this.title });

        var rightButtonDefaults = {
            click:function () {
                if (this.creator.navigationClick) this.creator.navigationClick(this.direction);
            }
        };
        if (this.rightButtonTitle != null) rightButtonDefaults.title = this.rightButtonTitle;
        if (this.rightButtonIcon != null) rightButtonDefaults.icon = this.rightButtonIcon;
        this.rightButton = this.createAutoChild("rightButton", rightButtonDefaults);
        this.setShowRightButton(this.showRightButton != false);

        this.setControls(this.controls);
    },

    //> @method navigationBar.setTitle()
    // Updates the title for this navigationBar.
    // @param newTitle (String) New title
    // @visibility external
    //<
    setTitle : function (newTitle) {
        this.title = newTitle;
        this.titleLabel.setContents(this.title);
    },

    //> @method navigationBar.setLeftButtonTitle()
    // Setter for +link{leftButtonTitle}
    // @param newTitle (String) new title for left button
    // @visibility external
    //<
    setLeftButtonTitle : function (newTitle) {
        this.leftButtonTitle = newTitle;
        if (this.leftButton) this.leftButton.setTitle(newTitle);
    },

    //> @method navigationBar.setLeftButtonIcon()
    // Setter for +link{leftButtonIcon}
    // @param newIcon (SCImgURL) new icon for left button
    // @visibility external
    //<
    setLeftButtonIcon : function (newIcon) {
        this.leftButtonIcon = newIcon;
        if (this.leftButton) this.leftButton.setIcon(newIcon);
    },

    //> @method navigationBar.setShowLeftButton()
    // Show or hide the +link{leftButton}
    // @param visible (boolean) if true, the button will be shown, otherwise hidden.
    // @visibility external
    //<
    setShowLeftButton : function (show) {
        if (this.leftButton == null) return;
        var visible = (this.leftButton.visibility != isc.Canvas.HIDDEN);
        if (show == visible) return;
        // Calling setVisibility rather than show/hide so if the button is
        // created but not currently in our members array we don't draw it on 'show'
        this.leftButton.setVisibility(show ? isc.Canvas.INHERIT : isc.Canvas.HIDDEN);
    },

    //> @method navigationBar.setRightButtonTitle()
    // Setter for +link{rightButtonTitle}
    // @param newTitle (String) new title for right button
    // @visibility external
    //<
    setRightButtonTitle : function (newTitle) {
        if (this.rightButton) this.rightButton.setTitle(newTitle);
    },
    //> @method navigationBar.setRightButtonIcon()
    // Setter for +link{rightButtonIcon}
    // @param newIcon (SCImgURL) new icon for right button
    // @visibility external
    //<
    setRightButtonIcon : function (newIcon) {
        this.rightButtonIcon = newIcon;
        if (this.rightButton) this.rightButton.setIcon(newIcon);
    },

    //> @method navigationBar.setShowRightButton()
    // Show or hide the +link{rightButton}
    // @param visible (boolean) if true, the button will be shown, otherwise hidden.
    // @visibility external
    //<
    setShowRightButton : function (show) {
        if (this.rightButton == null) return;
        var visible = (this.rightButton.visibility != isc.Canvas.HIDDEN);
        if (show == visible) return;
        this.rightButton.setVisibility(show ? isc.Canvas.INHERIT : isc.Canvas.HIDDEN);

    }


});

isc.NavigationBar.registerStringMethods({
    //> @method navigationBar.navigationClick()
    // Notification method fired when the user clicks the +link{leftButton} or +link{rightButton}
    // @param direction (NavigationDirection) direction in which the user is attempting to
    //   navigate
    // @visibility external
    //<
    navigationClick:"direction"
});



//> @class SplitPane
// A device- and orientation-sensitive layout that implements the common pattern of rendering
// two panes side-by-side on desktop devices and tablets (eg iPad) in landscape orientation,
// while switching to showing a single pane for handset-sized devices or tablets in portrait
// orientation.
// <P>
// The SplitPane's main components are the +link{navigationPane} and the +link{detailPane}.
// Both components will be displayed side by side as columns when viewed on a
// desktop device or a tablet in landscape mode.<br>
// Only one pane will be shown at a time when viewed on a handset sized device
// (such as iPhone), or a tablet in portrait orientation. By default the +link{detailPane} is
// shown, and the +link{showNavigationPane()} / +link{showDetailPane()} methods may be called
// to switch between views.
// <P>
//
//
// @visibility external
// @treeLocation Client Reference/Layout
//<
isc.defineClass("SplitPane", "VLayout");

isc.SplitPane.addProperties({

    mainLayoutDefaults: {
        _constructor: "HLayout",
        width: "100%",
        height: "100%"
    },

    leftLayoutDefaults: {
        _constructor: "VLayout",
        width: 320,
        height: "100%"
    },

    rightLayoutDefaults: {
        _constructor: "VLayout",
        width: "*",
        height: "100%"
    },

    navigationLayoutDefaults: {
        _constructor: "VLayout",
        width: "100%",
        height: "100%"
    },

    listLayoutDefaults: {
        _constructor: "VLayout",
        width: "100%",
        height: "100%"
    },

    detailLayoutDefaults: {
        _constructor: "VLayout",
        width: "100%",
        height: "100%"
    },

    //> @attr splitPane.navigationBar (NavigationBar : null : IR)
    // The AutoChild +link{class:NavigationBar, navigationBar} managed by this widget.
    //
    // @visibility external
    //<
    navigationBarDefaults: {
        _constructor: "NavigationBar",
        hieght:44,
        navigationClick : function (direction) {
            this.creator.navigationClick(direction);
        }
    },

    //> @attr splitPane.navigationPane (Canvas : null : IRW)
    // The left-hand of the two panes managed by this widget, used for navigation.
    //
    // @visibility external
    //<

    //> @attr splitPane.listPane (Canvas : null : IRW)
    // An optional list pane displayed in the left-hand of the panes or in a popup
    // according to the pane layout.
    //
    // @visibility external
    //<

    //> @attr splitPane.detailPane (Canvas : null : IRW)
    // The right-hand of the two panes managed by this widget, used for viewing details.
    //
    // @visibility external
    //<

    //> @attr splitPane.detailToolStrip (AutoChild NavigationBar : null : IR)
    // Toolstrip servicing the +link{detailPane}.
    //
    // @visibility external
    //<
    detailToolStripDefaults: {
        _constructor: "NavigationBar",
        hieght:44
    },

    //> @attr splitPane.detailToolButtons (Array of Canvas : null : IRW)
    // Tool buttons to display in the detail +link{detailToolStrip}.
    // @visibility external
    //<

    //> @method splitPane.setDetailToolButtons()
    // Update the +link{splitPane.detailToolButtons} at runtime
    // @param buttons (array of Canvas) new controls for the toolstrip
    // @visibility external
    //<
    setDetailToolButtons : function (buttons) {

        this.detailToolButtons = buttons;
        this.updateDetailToolStrip();
    },

    autoChildren: ["mainLayout", "leftLayout", "rightLayout", "navigationLayout", "navigationBar",
                   "listLayout", "detailLayout", "detailToolStrip"],

    isHandset : function () {
        return this.layoutMode == "handset" || isc.Browser.isHandset;
    },
    isTablet : function () {
        return this.layoutMode == "tablet" || isc.Browser.isTablet;
    },
    getPageOrientation : function () {
        return this.pageOrientation || isc.Page.getOrientation()
    },

    initWidget : function () {
        this.Super("initWidget", arguments);

        this.addAutoChildren(this.autoChildren, "none");

        this.addMember(this.mainLayout);

        if (this.navigationPane != null) this._setNavigationPane(this.navigationPane);
        if (this.detailPane != null) this._setDetailPane(this.detailPane);

        isc.Page.setEvent("orientationChange", this.getID()+".pageOrientationChanged()");

        if (this.initialPane != null) {
            this.currentPane = this.initialPane;
        } else {


            if (this.isHandset()) {
                if (this.listPane != null) {
                    this.currentPane = "list";
                } else {
                    this.currentPane = "navigation";
                }
            } else {
                this.currentPane = "detail";
            }
        }
        this.pageOrientationChanged();
    },

    pageOrientationChanged : function () {
        this.updateUI();
    },

    updateUI : function (forceRefresh) {

        var prevConfig = this.currentUIConfig,
            prevPane = this._lastPane;

        // Possible UI configurations:
        // - handset (one pane at a time)
        // - portrait (detailPane always visible, navigation and list panes shows as a popup)
        // - landscape (two panes are visible as columns)
        var config = this.currentUIConfig = this.getUIConfiguration(),
            pane = this._lastPane = this.currentPane;

        if (!forceRefresh && config == prevConfig && pane == prevPane) return;

        if (config == "handset") {
            // navigation bar shown in both views
            // (Repurposed for detail view to show detail title etc)
            this.updateNavigationBar();

            if (pane == "navigation") {

                this.navigationLayout.setMembers([this.navigationBar, this.navigationPane]);
                this.mainLayout.setMembers([this.navigationLayout]);

            } else if (pane == "detail") {
                var members = [this.navigationBar, this.detailPane];

                if (this.detailToolButtons != null) {
                    this.updateDetailToolStrip();
                    members.add(this.detailToolStrip);
                }

                this.detailLayout.setMembers(members);
                this.mainLayout.setMembers([this.detailLayout]);

            } else {

                var members = [this.navigationBar, this.listPane];

                this.listLayout.setMembers(members);
                this.mainLayout.setMembers([this.listLayout]);

            }

        } else if (config == "portrait") {
            // Detail toolstrip across the top
            //  - first button to show navigation or list view
            //  - detail nav control as 2nd button
            //  - detail title
            //  - detail tool buttons
            // Detail pane shows
            // If currentPane is "list":
            //  - pop up containing
            //      - navigation bar
            //      - list pane
            // If currentPane is "navigation":
            //  - pop up containing
            //      - navigation bar
            //      - navigation pane
            this.updateDetailToolStrip();
            this.detailLayout.setMembers([this.detailToolStrip,this.detailPane]);
            this.mainLayout.setMembers([this.detailLayout]);

            if (this.currentPane == "navigation") {
                if (this.listPopUp != null && this.listPopUp.isVisible()) {
                    this.listPopUp.hide();
                }

                this.updateNavigationBar();

                if (this.navigationPopUp == null) {

                    // We expect to only load the mobile skin where PopupWindow is defined
                    var cs = isc.PopupWindow || isc.Window;

                    this.navigationPopUp = this.createAutoChild(
                        "navigationPopUp",
                        {   _constructor:cs,
                            headerControls:[this.navigationBar],
                            items:[this.navigationPane],
                            width:"50%",
                            height:"80%",
                            isModal:true,
                            showModalMask:true,
                            dismissOnOutsideClick:true,
                            // fired from outside click
                            closeClick:function () {
                                this.creator.showDetailPane();
                            }
                        }
                    );
                } else {
                    this.navigationPopUp.setHeaderControls([this.navigationBar]);
                    if (!this.navigationPopUp.items ||
                        !this.navigationPopUp.items.contains(this.navigationPane))
                    {
                       this.navigationPopUp.addItem(this.navigationPane);
                    }
                }

                // show on a tiny delay so we can check page left/top coords reliably
                this.delayCall("_showNavPopUp");

            } else if (this.currentPane == "list") {
                if (this.navigationPopUp != null && this.navigationPopUp.isVisible()) {
                    this.navigationPopUp.hide();
                }

                if (this.listPopUp == null) {

                    // We expect to only load the mobile skin where PopupWindow is defined
                    var cs = isc.PopupWindow || isc.Window;

                    this.listPopUp = this.createAutoChild(
                        "listPopUp",
                        {   _constructor:cs,
                            headerControls:[this.navigationBar],
                            items:[this.listPane],
                            width:"50%",
                            height:"80%",
                            isModal:true,
                            showModalMask:true,
                            dismissOnOutsideClick:true,
                            // fired from outside click
                            closeClick:function () {
                                this.creator.showDetailPane();
                            }
                        }
                    );
                } else {
                    this.listPopUp.setHeaderControls([this.navigationBar]);
                    if (!this.listPopUp.items ||
                        !this.listPopUp.items.contains(this.listPane))
                    {
                       this.listPopUp.addItem(this.listPane);
                    }
                }

                // show on a tiny delay so we can check page left/top coords reliably
                this.delayCall("_showListPopUp");
            } else {
                if (this.navigationPopUp != null && this.navigationPopUp.isVisible()) {
                    this.navigationPopUp.hide();
                }
                if (this.listPopUp != null && this.listPopUp.isVisible()) {
                    this.listPopUp.hide();
                }
            }


        } else if (config == "landscape") {
            // Landscape view
            //   This mode is used for landscape tablet views.
            //   Only 2 panes are shown at once.
            //
            // With list:
            //     Left side:
            //       Nav bar with button to show navigation view
            //         List title
            //       List pane
            //     Right side:
            //       Toolstrip with prev/next buttons
            //         No title
            //       Detail pane
            //
            // NO list:
            //     Left side:
            //       Nav bar
            //       Nav title
            //       Nav pane
            //     Right side:
            //       Detail Toolstrip
            //         Detail title
            //         Detail tool buttons

            if (this.navigationPopUp != null) {
                if (this.navigationPopUp.isVisible()) this.navigationPopUp.hide();
                // clear up the "items" pointer to the navigation pane so it
                // gets re added properly if we rotate back to portrait, and re-show!
                if (this.navigationPopUp.items &&
                    this.navigationPopUp.items.contains(this.navigationPane))
                {
                    this.navigationPopUp.removeItem(this.navigationPane);
                }
            }

            this.updateNavigationBar();
            this.navigationLayout.setMembers([
                this.navigationBar,
                this.navigationPane
            ]);
            this.updateDetailToolStrip();
            this.detailLayout.setMembers([
                this.detailToolStrip,
                this.detailPane
            ]);

            if (this.listPane != null) {
                if (pane != "navigation") {
                    this.listLayout.setMembers([
                        this.navigationBar,
                        this.listPane
                    ]);
                    this.leftLayout.setMembers([this.listLayout]);
                } else {
                    this.leftLayout.setMembers([this.navigationLayout]);
                }
            } else {
                this.leftLayout.setMembers([this.navigationLayout]);
            }
            this.rightLayout.setMembers([this.detailLayout]);
            // This should be managed with styling - but for now use an explicit separator
            if (this.spacer == null) {
                this.spacer = isc.Canvas.create({backgroundColor:"black",
                                    overflow:"hidden", height:"100%", width:1, autoDraw:false});
            }
            this.mainLayout.setMembers([this.leftLayout, this.spacer, this.rightLayout]);

        } else {
            // Desktop view
            //   This mode is used for the desktop view.
            //   All 3 panes may be shown.
            //
            // With list:
            //     Left side:
            //       Nav bar
            //       Nav title
            //       Nav pane
            //     Right side:
            //       Detail Toolstrip
            //         List title
            //         List tool buttons
            //       Detail pane
            //
            // NO list:
            //     Left side:
            //       Nav bar
            //       Nav title
            //       Nav pane
            //     Right side:
            //       Detail Toolstrip
            //         Detail title
            //         Detail tool buttons

            this.updateNavigationBar();
            this.navigationLayout.setMembers([
                this.navigationBar,
                this.navigationPane
            ]);
            // In desktop mode, the detail toolstrip goes with the listPane.
            this.updateDetailToolStrip();
            if (this.listPane != null) {
                this.listLayout.setMembers([
                    this.detailToolStrip,
                    this.listPane
                ]);
                this.detailLayout.setMembers([
                    this.detailPane
                ]);
            } else {
                this.detailLayout.setMembers([
                    this.detailToolStrip,
                    this.detailPane
                ]);
            }

            this.leftLayout.setMembers([this.navigationLayout]);
            var members = (this.listPane != null ? [this.listLayout] : []);
            members.add(this.detailLayout);
            this.rightLayout.setMembers(members);
            this.mainLayout.setMembers([this.leftLayout, this.rightLayout]);
        }
    },

    _showNavPopUp : function () {
        if (!this.navigationPopUp ||
            (this.navigationPopUp.isVisible() && this.navigationPopUp.isDrawn())) return;
        this.navigationPopUp.setPageTop(this.navigationPopUpButton.getPageBottom());
        this.navigationPopUp.setPageLeft(this.navigationPopUpButton.getPageLeft());

        this.navigationPopUp.show();
    },

    _showListPopUp : function () {
        if (!this.listPopUp ||
            (this.listPopUp.isVisible() && this.listPopUp.isDrawn())) return;
        this.listPopUp.setPageTop(this.listPopUpButton.getPageBottom());
        this.listPopUp.setPageLeft(this.listPopUpButton.getPageLeft());

        this.listPopUp.show();
    },

    updateDetailToolStrip : function () {

        // handset mode - only shows on detail view and contains just the detailToolButtons,
        // cenetered
        if (this.currentUIConfig == "handset") {
            var members = [isc.LayoutSpacer.create({width:"*"})];
            members.addList(this.detailToolButtons);
            members.add(isc.LayoutSpacer.create({width:"*"}));

            // Probably not required - could happen if switching from 'portrait' to
            // 'handset' - so only possible with an explicit override to the
            // ui config since the device won't change!
            if (this.detailTitleLabel && this.detailTitleLabel.isDrawn()) {
                this.detailTitleLabel.deparent();
            }

            this.detailToolStrip.setMembers(members);

        // portrait mode - always visible at top
        // Contains
        // - navigation pop up button
        // - detailNavigationControl (if set)
        // - detail tool buttons on right
        // Float title across center
        } else if (this.currentUIConfig == "portrait") {

            if (this.navigationPopUpButton == null) {
                this.navigationPopUpButton = this.createAutoChild(
                    "navigationPopUpButton",
                    {   _constructor:"IButton",
                        title:this.navigationTitle,
                        click : function () {
                            this.creator.showNavigationPane();
                        }
                    }
                );
            } else {
                this.navigationPopUpButton.setTitle(this.navigationTitle);
            }

            if (this.listPopUpButton == null) {
                this.listPopUpButton = this.createAutoChild(
                    "listPopUpButton",
                    {   _constructor:"IButton",
                        title:this.listTitle,
                        click : function () {
                            this.creator.showListPane();
                        }
                    }
                );
            } else {
                this.listPopUpButton.setTitle(this.listTitle);
            }

            this.updateDetailTitleLabel();

            var members = [
                (this.currentPane != "navigation"
                    ? this.listPopUpButton
                    : this.navigationPopUpButton),
                this.detailNavigationControl,
                this.detailTitleLabel
            ];
            if (this.detailToolButtons != null) {
                members.addList(this.detailToolButtons);
            }
            members.removeEmpty();
            this.detailToolStrip.setMembers(members);


        } else {
            // Default view (tablet landscape or desktop)
            //      - detail title
            //      - detail tool buttons
            this.updateDetailTitleLabel();
            var members = [
                this.detailTitleLabel
            ];
            if (this.detailToolButtons != null) {
                members.addList(this.detailToolButtons);
            }
            this.detailToolStrip.setMembers(members);
        }
    },

    updateDetailTitleLabel : function () {
        if (this.detailTitleLabel == null) {
            this.detailTitleLabel = isc.Label.create({
                    autoDraw:false,
                    align:"center",

                    valign:"center",
                    width:"*",

                    //snapTo:"C",
                    height:this.detailToolStrip.getHeight()
            });
        }
        this.detailTitleLabel.setContents(this.detailTitle);
    },

    updateNavigationBar : function () {
        this.logInfo("updateNavigationBar, currentPane: " + this.currentPane +
                     ", currentUI: " + this.currentUIConfig);

        // When showing detail view on a handset we show the navigation bar
        // but repurpose it as a detail navigation bar.
        //      - custom left button to return to navigation pane
        //      - Detail pane title
        //      - custom right button based on 'detail nav control'
        if ((this.currentUIConfig == "handset" && this.currentPane != "navigation") ||
            (this.currentUIConfig == "portrait" && this.currentPane == "list") ||
            (this.currentUIConfig == "landscape" && this.currentPane != "navigation"))
        {
            // In portrait mode we show the nav or list pane
            // and the detail pane at the same time
            // In this case the title should reflect the current pane visible on the left
            var title;
            if (this.currentUIConfig == "landscape") {
                title = this.listPane != null && this.listPane.isVisible() ? this.listTitle
                                                                    : this.navigationTitle;
            } else {
                title = (this.currentPane == "detail"
                         ? this.detailTitle
                         : (this.currentPane == "list"
                            ? this.listTitle
                            : this.navigationTitle));
            }
            if (title == null) title = "&nbsp;";

            this.navigationBar.setTitle(title);

            if (this.showNavigationPaneButton == null) {
                this.showNavigationPaneButton = this.createAutoChild(
                    "showNavigationPaneButton",
                    {   _constructor:isc.NavigationButton,
                        direction:"back",


                        title:(this.currentPane == "detail" && this.listPane != null
                               ? this.listTitle : this.navigationTitle),
                        click : function () {
                            if (this.creator.currentPane == "detail" &&
                                this.creator.listPane != null &&
                                // this is a check for landscape mode only
                                !(this.creator.listPane.isVisible() &&
                                    this.creator.listPane.isDrawn()))
                            {
                                this.creator.showListPane();
                            } else {
                                this.creator.showNavigationPane();
                            }
                        }
                    }
                );
            } else {
                this.showNavigationPaneButton.setTitle(
                    this.currentPane == "detail" &&
                                    this.listPane != null &&
                                    !(this.listPane.isVisible() && this.listPane.isDrawn())
                        ? this.listTitle
                        : this.navigationTitle
                );
            }

            var controls = [this.showNavigationPaneButton, "titleLabel"];
            if (this.detailNavigationControl != null) {
                controls.add(this.detailNavigationControl);
            }
            this.navigationBar.setControls(controls);

        // default behavior - navigation bar shows navigation title and controls
        // specified by the developer (so update title, icons, visibility)
        } else {

            this.navigationBar.setTitle(this.navigationTitle);

            this.navigationBar.setLeftButtonTitle(this.leftButtonTitle);
            this.navigationBar.setRightButtonTitle(this.rightButtonTitle);

            this.navigationBar.setControls(["leftButton", "titleLabel", "rightButton"]);

            this.navigationBar.setShowLeftButton(this.showLeftButton);
            this.navigationBar.setShowRightButton(this.showRightButton);
        }

    },

    _getShowNavigationPaneButton : function (title) {
        if (this.showNavigationPaneButton == null) {
            this.showNavigationPaneButton = this.createAutoChild(
                "showNavigationPaneButton",
                {   _constructor:isc.NavigationButton,
                    direction:"back",


                    title:title,
                    click:function () {
                        this.creator.showNavigationPane();
                    }
                }
            );
        } else {
            this.showNavigationPaneButton.setTitle(title);
        }
        return this.showNavigationPaneButton;
    },

    //> @type SplitPaneUIConfiguration
    // @value "handset" Show a single pane at a time - default view for handset devices.
    // @value "portrait" Always show the detail pane and use a pop up to display the
    //              navigation pane as required. Default view for tablet devices in
    //              portrait orientation.
    // @value "landscape" Show both panes side by side in columns. Default view for
    //              tablet devices in landscape orientation.
    // @value "desktop" Show both panes side by side in columns. Default view for
    //              desktop devices.
    // @visibility internal
    //<

    //> @attr splitPane.uiConfiguration (SplitPaneUIConfiguration : null : IRW)
    // Explicit +link{SplitPaneUIConfiguration} for this splitPane. This overrides the
    // standard behavior of deriving the UI configuration based on the browser / device
    // configuration.
    // @visibility internal
    //<

    //> @method splitPane.getUIConfiguration ()
    // Returns the current UI configuration for this device. If +link{this.uiConfiguration}
    // has been explicitly set it will be respected, otherwise the appropriate configuration
    // is derived based on the browser configuration in which the component is being rendered.
    //
    // @return (SplitPaneUIConfiguration) configuration to show
    // @visibility internal
    //<
    getUIConfiguration : function () {
        if (this.uiConfiguration != null) return this.uiConfiguration;
        if (this.isHandset()) return "handset";
        else if (this.isTablet() && this.getPageOrientation() == "portrait") return "portrait";
        else if (this.isTablet() && this.getPageOrientation() == "landscape") return "landscape";
        else return "desktop";
    },

    //> @attr splitPane.showLeftButton (boolean : true : IRW)
    // Should the +link{navigationBar.leftButton} be shown in our navigation bar?
    //<
    showLeftButton:true,

    //> @method splitPane.setShowLeftButton()
    // Show or hide the +link{navigationBar.leftButton}.  Note that the default behavior is to
    // automatically create and show a "back button" as the left button that allows
    // transitioning back to the navigationPane (tablet and handset mode) or the listPane
    // (handset mode).
    //
    // @param visible (boolean) if true, the button will be shown, otherwise hidden.
    // @visibility external
    //<
    setShowLeftButton : function (show) {
        this.showLeftButton = show;
        this.updateNavigationBar();
    },
    //> @method splitPane.setLeftButtonTitle()
    // Setter for +link{navigationBar.leftButtonTitle}.  Note that this is normally
    // automatically set to the navigationPaneTitle or listPaneTitle as appropriate.
    //
    // @param newTitle (String) new title for left button
    // @visibility external
    //<
    setLeftButtonTitle : function (newTitle) {
        this.leftButtonTitle = newTitle;
        this.updateNavigationBar();
    },
    //> @method splitPane.setLeftButtonIcon()
    // Setter for +link{navigationBar.LeftButtonIcon}.
    // @param newIcon (SCImgURL) new icon for Left button
    // @visibility external
    //<
    setLeftButtonIcon : function (newIcon) {
        this.leftButtonIcon = newIcon;
        this.updateNavigationBar();
    },

    //> @attr splitPane.showRightButton (boolean : true : IRW)
    // Should the +link{navigationBar.rightButton} be shown in our navigation bar?
    //<
    showRightButton:true,

    //> @method splitPane.setShowRightButton()
    // Show or hide the +link{navigationBar.rightButton}.
    // @param visible (boolean) if true, the button will be shown, otherwise hidden.
    // @visibility external
    //<
    setShowRightButton : function (show) {
        this.showRightButton = show;
        this.updateNavigationBar();
    },
    //> @method splitPane.setRightButtonTitle()
    // Setter for +link{navigationBar.rightButtonTitle}
    // @param newTitle (String) new title for right button
    // @visibility external
    //<
    setRightButtonTitle : function (newTitle) {
        this.rightButtonTitle = newTitle;
        this.updateNavigationBar();
    },

    //> @method splitPane.setRightButtonIcon()
    // Setter for +link{navigationBar.rightButtonIcon}.
    // @param newIcon (SCImgURL) new icon for right button
    // @visibility external
    //<
    setRightButtonIcon : function (newIcon) {
        this.rightButtonIcon = newIcon;
        this.updateNavigationBar();
    },

    _setNavigationPane : function (pane) {
        this.navigationPane = pane;
        this.navigationPane.setWidth("100%");
        this.navigationPane.setHeight("100%");
        this.navigationPane.splitPane = this;
    },

    //> @method splitPane.setNavigationPane()
    // Update the navigation pane at runtime
    // @param pane (Canvas) new navigation pane
    // @visibility external
    //<
    setNavigationPane : function (pane) {
        this._setNavigationPane(pane);
        if (this.currentView == "navigation") {
            this.updateUI(true);
        }
    },

    //> @method splitPane.setNavigationTitle()
    // Sets the title for the Navigation Pane.
    // @param  title (String)  new title for the navigation pane
    // @visibility external
    //<
    setNavigationTitle : function (title) {
        this.navigationTitle = title;
        this.updateNavigationBar();
    },

    //> @method splitPane.showNavigationPane()
    // Causes a transition to the Navigation Pane
    // @visibility external
    //<
    showNavigationPane : function () {
        var changed = this.currentPane != null && this.currentPane != "navigation";
        this.currentPane = "navigation";
        this.updateUI();
        // notification method that the pane changed.

        if (changed && this.paneChanged != null) this.paneChanged("navigation");

    },

    _setListPane : function (pane) {
        this.listPane = pane;
        this.listPane.setWidth("100%");
        this.listPane.setHeight("100%");
        this.listPane.splitPane = this;
    },

    //> @method splitPane.setListPane()
    // Set a new listPane at runtime
    // @param pane (Canvas) new list pane for this widget
    // @visibility external
    //<
    setListPane : function (pane) {

        this._setListPane(pane);
        this.updateUI(true);
    },

    //> @method splitPane.showListPane()
    // Causes a transition to the List Pane
    // @visibility external
    //<
    showListPane : function () {
        var newPane = (this.listPane != null ? "list" : "detail");
        var changed = (newPane != this.currentPane);
        this.currentPane = newPane
        this.updateUI();

        if (changed && this.paneChanged != null) this.paneChanged(newPane);
    },

    //> @method splitPane.setListTitle()
    // Sets the title for the List Pane.
    // @param  title (String)  new title for the list pane
    // @visibility external
    //<
    setListTitle : function (title) {
        this.listTitle = title;


        this.updateNavigationBar();
        this.updateDetailToolStrip();
    },

    _setDetailPane : function (pane) {
        this.detailPane = pane;
        this.detailPane.setWidth("100%");
        this.detailPane.setHeight("100%");
        this.detailPane.splitPane = this;
    },

    //> @method splitPane.setDetailPane()
    // Set a new detailPane at runtime
    // @param pane (Canvas) new detail pane for this widget
    // @visibility external
    //<
    setDetailPane : function (pane) {

        this._setDetailPane(pane);
        this.updateUI(true);
    },

    //> @method splitPane.showDetailPane()
    // Causes a transition to the Detail Pane
    // @visibility external
    //<
    showDetailPane : function () {
        var changed = (this.currentPane != "detail");
        this.currentPane = "detail";
        this.updateUI();

        if (changed && this.paneChanged != null) this.paneChanged("detail");
    },

    //> @method splitPane.setDetailTitle()
    // Sets the title for the Detail Pane.
    // @param  title (String)  new title for the detail pane
    // @visibility external
    //<
    setDetailTitle : function (title) {
        this.detailTitle = title;
        // In handset mode we need to update the navigation bar
        // otherwise we'll update the detailToolStrip
        if (this.currentUIConfig == "handset") {
            if (this.currentPane == "detail") this.updateNavigationBar();
        } else {
            this.updateDetailToolStrip();
        }
    },

    //> @method splitPane.navigationClick()
    // Notification method fired when the user clicks the default back / forward buttons
    // on the navigation bar for this splitPane
    // @param direction (String) "back" or "forward"
    // @visibility external
    //<
    navigationClick : function (direction) {
    },

    //> @attr splitPane.detailNavigationControl (Canvas : null : IRWA)
    // Navigation control that appears only when the navigation pane is not showing (showing detail
    // pane on handset, or portrait mode on tablet).
    // @visibility external
    //<

    //> @method splitPane.setDetailNavigationControl()
    // Navigation control that appears only when the navigation pane is not showing (showing detail
    // pane on handset, or portrait mode on tablet).
    // @param control (Canvas)
    // @visibility external
    //<
    setDetailNavigationControl : function (canvas) {
        this.detailNavigationControl = canvas;
        var updateUI = this.currentUIConfig != "landscape" && this.currentPane == "detail";
        if (updateUI) this.updateUI(true);
    }
});

isc.SplitPane.registerStringMethods({
    // Notification method fired when the currently showing pane changes.

    paneChanged:"pane"
});

isc._debugModules = (isc._debugModules != null ? isc._debugModules : []);isc._debugModules.push('Foundation');isc.checkForDebugAndNonDebugModules();isc._moduleEnd=isc._Foundation_end=(isc.timestamp?isc.timestamp():new Date().getTime());if(isc.Log&&isc.Log.logIsInfoEnabled('loadTime'))isc.Log.logInfo('Foundation module init time: ' + (isc._moduleEnd-isc._moduleStart) + 'ms','loadTime');delete isc.definingFramework;}else{if(window.isc && isc.Log && isc.Log.logWarn)isc.Log.logWarn("Duplicate load of module 'Foundation'.");}

/*

  SmartClient Ajax RIA system
  Version v9.0p_2013-10-13/EVAL Deployment (2013-10-13)

  Copyright 2000 and beyond Isomorphic Software, Inc. All rights reserved.
  "SmartClient" is a trademark of Isomorphic Software, Inc.

  LICENSE NOTICE
     INSTALLATION OR USE OF THIS SOFTWARE INDICATES YOUR ACCEPTANCE OF
     ISOMORPHIC SOFTWARE LICENSE TERMS. If you have received this file
     without an accompanying Isomorphic Software license file, please
     contact licensing@isomorphic.com for details. Unauthorized copying and
     use of this software is a violation of international copyright law.

  DEVELOPMENT ONLY - DO NOT DEPLOY
     This software is provided for evaluation, training, and development
     purposes only. It may include supplementary components that are not
     licensed for deployment. The separate DEPLOY package for this release
     contains SmartClient components that are licensed for deployment.

  PROPRIETARY & PROTECTED MATERIAL
     This software contains proprietary materials that are protected by
     contract and intellectual property law. You are expressly prohibited
     from attempting to reverse engineer this software or modify this
     software for human readability.

  CONTACT ISOMORPHIC
     For more information regarding license rights and restrictions, or to
     report possible license violations, please contact Isomorphic Software
     by email (licensing@isomorphic.com) or web (www.isomorphic.com).

*/

