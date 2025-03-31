const funcs:Array<JBSFunc> = [];
const objects:Array<JBSType> = [];

type JBSType = {name: string, info: string, desc: string, type : vscode.CompletionItemKind};//, args: string[]};
type JBSFunc = JBSType & {args : Array<string>};//, args: string[]};

//type JBSObjects = {props : Array<[string, vscode.CompletionItemKind?]>}; //, testArgs : (args: string) => JBSObjects};
type SignatureInfo = Array<[string, vscode.CompletionItemKind?]>;

function makeArgs(info : string, desc : string) {
	return {info, desc, args: info.substring(info.indexOf("(")+1, info.indexOf(")")).split(", ")};
}

type SpecialArray = {
	[index: string]: {info: string, desc: string, args: Array<string>}
}

function registerFunc(name : string, info : string, desc : string = "") {//, args: string[]) {
	//const shit : JBSType = ;
	funcs.push({name, info, desc, type: 2, args: info.substring(info.indexOf("(")+1, info.indexOf(")")).split(", ")});
}

function registerGlobalObject(name : string, info : string, desc : string = "") {//, args: string[]) {
	//const shit : JBSType = ;
	objects.push({name, info, desc, type: 6});
}

//#region 
registerFunc("print", "function print(...args : any) : void", "replacement for `console.log` because it no work");
registerFunc("printNoHighlight", "function printNoHighlight(...args : any) : void", "basically print but doesn't do automatic highlighting (like when you use `print` on a string it's blue in the console)");
registerFunc("version", "function version(void) : string", "returns the version of v8 in string form");
registerFunc("OutputDebugString", "function OutputDebugString(str : wstring) : void", "Sends a string to the debugger for display.  \nbasically if you are connected to jbs with WinDbg or visual studio it will show up in the command/debug window (NOT the console)");
registerFunc("Sleep", "function Sleep(ms : number) : void", "calls the native `Sleep(ms)` function to pause the current thread for x milliseconds  \nA value of zero causes the thread to relinquish the remainder of its time slice to any other thread that is ready to run. If there are no other threads ready to run, the function returns immediately, and the thread continues execution.");
registerFunc("__debugbreak", "function __debugbreak(void) : void", "**this function will crash peggle if it's not attached to a debugger!**  \npauses execution (where this function is defined in Peggle.cpp)  \nwhen compiled, this function is replaced by the `int 3` asm instruction (0xcc)");
registerFunc("GetMousePos", "function GetMousePos(void) : {x: number, y: number}", "alias for `GetCursorPos`  \ncalls the native `GetCursorPos()` and returns the POINT's values");
registerFunc("GetCursorPos", "function GetCursorPos(void) : {x: number, y: number}", "calls the native `GetCursorPos()` and returns the POINT's values");
registerFunc("GetGUIThreadInfo", "function GetGUIThreadInfo(idThread : number) : GUITHREADINFO | {flags, hwndActive, hwndFocus, hwndCapture, hwndMenuOwner, hwndMoveSize, hwndCaret, rcCaret}", "idThread can be a value obtained from `GetWindowThreadProcessId` but if this parameter is `NULL`, the function returns information for the foreground thread.  \nreturns an object with info about the gui thread idk lol  \nthe returned object's `flags` property can be any `GUI_`... const");
registerFunc("GetWindowRect", "function GetWindowRect(hwnd : HWND | number) : RECT | {left : number, top : number, right : number, bottom : number}", "calls the native `GetWindowRect()` function and returns a `RECT` object with the properties  \n`left`,`top`,`right`,`bottom`");
registerFunc("GetKey", "function GetKey(keyCode : number | string[1]) : number", "checks if the keyCode (or letter) is currently being held  \ncalls the native `GetAsyncKeyState(keyCode) & 0x8000`");
registerFunc("GetKeyDown", "function GetKeyDown(keyCode : number | string[1]) : number", "checks if the keyCode (or letter) was just pressed  \ncalls the native `GetAsyncKeyState(keyCode) & 0x1` to tell when the key has just been hit");
registerFunc("getline", "function getline(wstr : wstring, length? : number) : wstring", "prints `wstr` and gets the input from the console (like std::wcin.getline or python's input(str) )  \nthe max length of the string returned from this function is `length` or 256"); //oops! i forgot i added this like 20 commits ago
registerFunc("SetForegroundWindow", "function SetForegroundWindow(hwnd : HWND | number) : number", "sets the foreground window with the supplied `HWND`  \nreturns 0 if failed i think");
registerFunc("GetConsoleWindow", "function GetConsoleWindow(void) : number", "returns a pointer to the console window (`HCONSOLE`)");

//registerGlobalObject("hInstance", "hInstance : HINSTANCE", "the hInstance associated with this process");

//registerFunc("PerformMicrotaskCheckpoint", "function PerformMicrotaskCheckpoint(void) : void", "calls `v8::Isolate -> PerformMicrotaskCheckpoint` but honestly im not 100% sure what it does (i mean im pretty sure it just checks the microtask queue and does one right?)");

registerFunc("onInit", "function onInit(handler : Function(void), canWaitLonger : boolean) : void", "the passed `handler` function is called whenever this js file has been re-read (whether it be because a new level is loaded or a file change is detected)  \nthe `canWaitLonger` boolean disables the 15 second execution timeout that's normally imposed on my js callbacks (because sometimes something breaks and without the timeout peggle would just hang lol)");
registerFunc("onBallCountModify", "function onBallCountModify(handler : Function(eax : number, amountToAdd : number, edx : number, ballCount : number), canWaitLonger : boolean) : void", "the `handler` function is called when the amount of balls you have changes with the parameters `eax`, `amountToAdd`, `edx`, and `ballCount`  \nthe number you return from this function determines how many balls to add to the current count (and not including this function in your file causes no balls to be added or removed)  \nthe `canWaitLonger` boolean disables the 15 second execution timeout that's normally imposed on my js callbacks (because sometimes something breaks and without the timeout peggle would just hang lol)");
registerFunc("onPegHit", "function onPegHit(handler : Function(currentBall : Ball, peg : PhysObj, unknown : boolean), canWaitLonger : boolean)", "the passed `handler` function is called whenever any ball hits any peg (including bricks lol)  \nthe handler function is passed 3 parameters  \n`currentBall` - the ball that hit the peg  \n`physObj2` - the peg that was hit (can be a `Ball` or a `Brick`)  \n`unknown` - lowkey i don't know  \nthe `canWaitLonger` boolean disables the 15 second execution timeout that's normally imposed on my js callbacks (because sometimes something breaks and without the timeout peggle would just hang lol)");
registerFunc("onKeyDown", "function onKeyDown(handler : Function(keyCode : number, unused2 : number, unused3 : number), canWaitLonger : boolean)", "the passed `handler` function is only called whenever you press a key during a level (not in the mainmenu or level select menus)  \nthe `handle` function is passed 3 parameters but the most notable one is the `keyCode` parameter and as its name suggests, it holds the key code of the key that was pressed (to compare, use charCodeAt like i did in `demo.js`)  \nthe `canWaitLonger` boolean disables the 15 second execution timeout that's normally imposed on my js callbacks (because sometimes something breaks and without the timeout peggle would just hang lol)");

registerFunc("createBall", "function createBall(isPeg : boolean, pushOntoBoard : boolean, x : float, y : float, vx : float, vy : float) : Ball", "this function creates a new ball based on the following parameters  \nwhen `isPeg` is true, this ball is anchored and created with the `PHYS_PEG` type  \n`pushOntoBoard` should usually be true (which means the ball will be added to the physObj and ball arrays). if `pushOntoBoard` is false, the ball will not be pushed to any arrays (this is useful if you want to manually reload the ball like i did in `demo.js` but you don't have to do this anymore)  \n`x`, `y`, `vx`, and `vy` control the position and velocity of the newly created ball (if `isPeg` is true, `vx` and `vy` do not actually move the ball lol)  \nthe default ball radius is 6.0 (and can be changed with the `defaultBallRadius` global)  \nthe default peg radius is 10.0 (but you have to set this yourself like i do in `demo.js`)");
registerFunc("createPegInfo", "function createPegInfo(owner? : PhysObj | number, type : number, animationId : number) : PegInfo", "this function creates a `PegInfo` object (which is responsible for all actual peg related stuff like getting hit)  \nif `owner` is supplied, this function will set the newly created PegInfo object into the owner PhysObj (and will increment the `refCount`)  \n`type` sets the new PegInfo's type, this parameter can be one of the `PEG_`* consts");
registerFunc("createMover", "function createMover(owner? : PhysObj | number, originX : float, originY : float) : Mover", "this function creates a `Mover` which is responsible for the movement of the `Hole` and other pegs  \nif `owner` is supplied, this function will set the newly created Mover object into the owner PhysObj (and will increment the `refCount`)  \n`originX` and `originY` controls where this mover will, well, move around");

registerGlobalObject("canFastForwardDuringTurns", "canFastForwardDuringTurns : boolean", "controls whether or not you are allowed to fast forward after you've shot the ball by changing a little assembly");
registerGlobalObject("canShootBallDuringTurns", "canShootBallDuringTurns : boolean", "controls whether or not you are allowed to shoot another ball during a turn (useful when i reload the gun in `demo.js`)");
registerGlobalObject("canShootPegs", "canShootPegs : boolean", "controls whether or not you are allowed to shoot a peg (this property doesn't fully work yet lol)");

registerGlobalObject("defaultTextColor", "defaultTextColor : number", "the default text color controls what color `FloatingText` objects will have when they first spawn  \nits default value is 0xFFFF00");
registerGlobalObject("fastForwardSpeed", "fastForwardSpeed : number", "the fast forwarding speed only ranges from 0-127!  \nits default value is 8");
registerGlobalObject("defaultBallRadius", "defaultBallRadius : float", "the default ball radius is 6.0");
registerGlobalObject("gravity", "gravity : float", "the default gravity is 0.05");

registerFunc("castPtrToObj", "function castPtrToObj(ptr : number) : any", "if `ptr` is bad or the object it points to has no vtable, peggle will crash. if `ptr` points to a valid object with a vtable, this function checks what the classname is and returns the corresponding js implementation  \nthis function only works on the following objects:  \nBall  \nPoly  \nBrick  \nPegInfo  \nFloatingText  \nHole  \nMover  \nLine");

import * as vscode from 'vscode';

//register special object returning functions

//function registerObjectReturningFunctionAndMethods(functionName: string, obj: JBSObjects, methods: SpecialArray) {
//    objectReturningFunctions.push([functionName, obj]);
//}

//type GenericObject = {[key : string]: any}; https://stackoverflow.com/questions/40641370/generic-object-type-in-typescript

//const objectMethodDesc : { [objectName: string]: { [index: string]: {info: string, desc: string, args: Array<string>} } } = {};

const objectMethodList : {[key : string]: {get: (args: string) => SignatureInfo, desc: SpecialArray}} = {};

const objectReturningInfo:Array<[string, string]> = [
    //["", "RECT"]
];

function registerOARFAS(objectName: string, functions: Array<string>, testProps: (args: string) => SignatureInfo, arr: SpecialArray) { //register object and related functions and signatures
    for(const func of functions) {
        objectReturningInfo.push([func, objectName]);
    }
    objectMethodList[objectName] = {get: testProps, desc: arr};
    //objectMethodDesc[objectName] = arr;
}

//function defaultTestArgs(this: JBSObjects, args: string) : JBSObjects { //ahh typescript compiles out the this parameter https://www.typescriptlang.org/play/?#code/C4TwDgpgBAUgQgZQPICMBWEDGwDOUC8UA3mAE4D2YeAXFAIKmkCGIAPANo7CkCWAdgHMAugD4ANFGAQuDATSgAKJqTm0uvQQEoCIqADdyPACYBfANwAoCwDMArn2w9yfKEYjWFwABY8cteMjoWLgSygJq3PwC2v6IqBjYeEQWUKlQpBDAtqQu3r6WJlYANplQAB5QsYEJuATEZJR+UOzsAEQAtkyC5K1CEm1cPEVFUADuTFKkvX2S0sCyTW7W5laYzjjkJQB0ReQCCmVbUjIqOAodXQLkg8Pjk62ammZAA
//    return this; //TRUST ME TS
//}

function extendMethods(objectName: string, arr: SpecialArray) : SpecialArray {
    return Object.assign(arr, objectMethodList[objectName].desc); //basically merges the target and source
}

function GenericPtrObject() : SignatureInfo {
	return [["set_dword", vscode.CompletionItemKind.Method], ["set_float", vscode.CompletionItemKind.Method], ["get_dword", vscode.CompletionItemKind.Method], ["get_float", vscode.CompletionItemKind.Method], ["location"], ["name"]];
}

function GenericPhysObject() : SignatureInfo {
	return [...GenericPtrObject(), ["refCount"], ["type"], ["collision"], ["visible"], ["enableMover"], ["time"], ["pegInfo", vscode.CompletionItemKind.Class], ["setPegType", vscode.CompletionItemKind.Method], ["mover", vscode.CompletionItemKind.Class], ["setVelocity", vscode.CompletionItemKind.Method], ["setPosition", vscode.CompletionItemKind.Method], ["getPosition", vscode.CompletionItemKind.Method], ["getX", vscode.CompletionItemKind.Method], ["getY", vscode.CompletionItemKind.Method], ["setActive", vscode.CompletionItemKind.Method], ["imgname", vscode.CompletionItemKind.Class], ["loadImageIfValidPath", vscode.CompletionItemKind.Method]];
}

function PolyObject() : SignatureInfo {
	return [...GenericPhysObject(), ["x"], ["y"], ["rotation"], ["setRotation", vscode.CompletionItemKind.Method]];
}

registerOARFAS(
    "RECT",
    ["GetWindowRect"],
    (args) => [["left"], ["top"], ["right"], ["bottom"]],
    {},
);

registerOARFAS(
    "POINT",
    ["GetMousePos", "GetCursorPos", "getPosition"],
    (args) => [["x"], ["y"]],
    {},
);

registerOARFAS(
	"PhysObj",
	[],
	(args) => GenericPhysObject(),
	{
		"setPegType" : makeArgs("function setPegType(type : number) : void", "the `type` of peg can be one of the `PEG_`* consts! (you could just set pegInfo.type yourself though lol)  \nthis function also SOMETIMES does SOMETHING else but honestly i have no idea yet"),
		"setVelocity" : makeArgs("function setVelocity(vx : float, vy : float)", "this function sets the velocity of this PhysObj"),
		"setPosition" : makeArgs("function setPosition(x : float, y : float)", "this function CORRECTLY sets the position of the PhysObj (yaeh you heard that right, directly setting the x and y properties of the PhysObj is NOT the proper way to do it because you'd also have to update the bounding box which i haven't added as properties yet)"),
		"getPosition" : makeArgs("function getPosition(void) : {x : float, y : float}", "this function returns the position of this PhysObj"),
		"getX" : makeArgs("function getX(void) : float", "this function returns the `x` position of this PhysObj"),
		"getY" : makeArgs("function getY(void) : float", "this function returns the `y` position of this PhysObj"),
		"setActive" : makeArgs("function setActive(active : boolean) : void", "this function enables/disables collision and visibility for this PhysObj"),
		"loadImageIfValidPath" : makeArgs("function loadImageIfValidPath(void) : void", "this function (if `this.imgname` is the name of an image (no file extension) in the `images/level/` directory INSIDE of the `main.pak` file) loads the corresponding image and draws it in place of this PhysObj  \nthis function does not work on PhysObjs of type `PHYS_BALL`!!"),
	},
);

registerOARFAS(
	"Ball",
	["Board.reloadGun", "createBall"],
	(args) => [...GenericPhysObject(), ["multiball"], ["x"], ["y"], ["velX"], ["velY"], ["drawX"], ["drawY"], ["radius"], ["anchored"], ["fireball"], ["idk"], ["destroy", vscode.CompletionItemKind.Method], ["method", vscode.CompletionItemKind.Method]],
	extendMethods("PhysObj", {
		"destroy" : makeArgs("function destroy(freeMemory : boolean) : void", "this function lowkey may or may not crash peggle if you use it  \nobviously don't try accessing the object after this calling this function with `freeMemory` as true"),
		"method" : makeArgs("function method(otherBall : Ball | number) : BOOL", "honestly i still don't know what this method does because i haven't used it yet! (it makes some kind of comparison though)"),
	}),
);

//lowkey i barely know anything about the Poly and Brick classes so...
registerOARFAS(
	"Poly",
	[],
	(args) => PolyObject(),
	extendMethods("PhysObj", {

	}),
);

registerOARFAS(
	"Brick",
	[],
	(args) => PolyObject(),
	extendMethods("Poly", {

	}),
);

registerOARFAS(
	"PegInfo",
	["createPegInfo"],
	(args) => [...GenericPtrObject(), ["refCount"], ["type"], ["hit"], ["timeSinceHit"], ["hitCount"], ["animationPercent"], ["animationId"]],
	{
		"setHit" : makeArgs("function setHit(hit : boolean) : void", "this function sets `hit` and resets the `timeSinceHit`"),
		"playPegAnimation" : makeArgs("function playPegAnimation(animationId : number) : void", "this function sets `animationPercent` to 1 (which plays the animation BUT not every animation! see `lightUpPeg`), and sets `animationId` to the first parameter's value"),
		"lightUpPeg" : makeArgs("function lightUpPeg(timeLength : number) : void", "this function plays an animation that not only works differently but **only works on orange pegs!**  \nthis function sets `animationPercent` to 32*`timeLength`-1 and sets `animationId` to 10"),
	},
);

registerOARFAS(
	"FloatingText",
	["LogicMgr.spawnFloatingText"],
	(args) => [...GenericPtrObject(), ["id"], ["color"], ["lifeTime"], ["elapsedTime"], ["number"], ["something"], ["followingObj", vscode.CompletionItemKind.Class], ["lastX"], ["lastY"], ["x"], ["y"], ["velX"], ["velY"], ["idk"], ["rotation"], ["velRotation"], ["text"]],
	{},
);

registerOARFAS(
	"Hole",
	[],
	(args) => GenericPhysObject(),
	extendMethods("PhysObj", {

	}),
);

registerOARFAS(
	"Mover",
	["createMover"],
	(args) => [...GenericPtrObject(), ["refCount"], ["type"], ["offset"], ["amplitude"], ["speedDivisor"], ["timingOffset"], ["optionalVerticalAmplitude"], ["x"], ["y"], ["originX"], ["originY"]],
	{},
);

registerOARFAS(
	"EmbeddedText",
	["LogicMgr.usernameTextObj", "LogicMgr.yellowTextObj"],
	(args) => [["textLength"], ["maxLength"], ["text"]],
	{},
);

registerOARFAS(
	"Line",
	[],
	(args) => [...GenericPhysObject(), ["drawLeft"], ["drawRight"], ["drawTop"], ["drawBottom"]],
	extendMethods("PhysObj", {

	}),
);

type DefObjType = {varName : string, props : SignatureInfo, name : string}
let definedObjects:Array<DefObjType> = [];
const globalObjects:Array<DefObjType> = [];

registerOARFAS(
	"LogicMgr",
	[],
	(args) => [["currentEvent"], ["eventTime"], ["specialsomething"], ["relatedX"], ["relatedY"], ["gunRotation"], ["nudgeTimeout"], ["shootBall"], ["playSoundAndShootBall"], ["mouseX"], ["mouseY"], ["multipliedPointsThisTurn"], ["originalPointsThisTurn"], ["orangeMultiplier"], ["pegsHit"], ["turnOffset"], ["gunReloadAnimationFrame"], ["purplePeg", vscode.CompletionItemKind.Class], ["score"], ["balls"], ["currentMaster"], ["currentAbility"], ["superGuideCount"], ["flipperCount"], ["pyramidCount"], ["spookyCount"], ["zenCount"], ["fireBallCount"], ["ballsShot"], ["freeBallsGivenByBucket"], ["freeBallsGivenByPoints"], ["idkyet"], ["replay"], ["won"], ["checkshit"], ["pegX"], ["pegY"], ["pegsLeft"], ["pegsLeftToPop"], ["orangePegsLeft"], ["bluePegsLeft"], ["pegsHitThisTurn"], ["activateAbility", vscode.CompletionItemKind.Method], ["addBalls", vscode.CompletionItemKind.Method], ["spawnFloatingText", vscode.CompletionItemKind.Method], ["enumOrangePegs", vscode.CompletionItemKind.Method], ["enumBluePegs", vscode.CompletionItemKind.Method], ["enumPegs", vscode.CompletionItemKind.Method]],
	{
		"activateAbility" : makeArgs("function activateAbility(activator : Ball | number, peg : PhysObj | number, ability : number, isAbilitySpecified : boolean) : void", "when `ability` is 0 and `isAbilitySpecified` is false, this function activates your current `ability`  \nwhen `ability` is non-zero and `isAbilitySpecified` is true, this function activates that `ability`  \nthe `ability` parameter can be any `ABILITY_`* const (or 0)  \nthings lowkey start getting a little rocky if you activate flower power or the space blast because it will trigger `onPegHit` which MIGHT go bad"),
		"addBalls" : makeArgs("function addBalls(amount : number, unknown : number, b_unknown2 : boolean) : void", "this function will add the `amount` of balls you specify to the current ball count  \nthis function also triggers `onBallCountModify` so **do not call this function in the `onBallCountModify` handler!**"),
		"spawnFloatingText" : makeArgs("function spawnFloatingText(text : string, x : float, y : float, graphicsType? = 0x2D : number) : FloatingText", "\nthis function creates a \"floating text\" object at the position you specify and the text you pass  \n`graphicsType` is usually always `0x2D` and it's likely that if you pass anything other than that, peggle might crash!  \nthis function returns the newly created `FloatingText` object!  \nFloatingText objects returned from this function by default have their `velY` property set to -0.01 (or something like that) and have a short `lifeTime`"),
		"enumOrangePegs" : makeArgs("function enumOrangePegs(callback : Function(peg : PhysObj)) : void", "the `callback` function can return a truthy value to cancel the enumeration.  \nthe reason these are enum functions instead of regular arrays is because this is how they actually do it in peggle (which is really weird)"),
		"enumBluePegs" : makeArgs("function enumBluePegs(callback : Function(peg : PhysObj)) : void", "the `callback` function can return a truthy value to cancel the enumeration.  \nthe reason these are enum functions instead of regular arrays is because this is how they actually do it in peggle (which is really weird)"),
		"enumPegs" : makeArgs("function enumPegs(callback : Function(peg : PhysObj)) : void", "the `callback` function can return a truthy value to cancel the enumeration.  \nthe reason these are enum functions instead of regular arrays is because this is how they actually do it in peggle (which is really weird)"),
	},
);

registerOARFAS(
	"Board",
	[],
	(args) => [["enumPhysObjs", vscode.CompletionItemKind.Method], ["click", vscode.CompletionItemKind.Method], ["setSlowMotion", vscode.CompletionItemKind.Method], ["reloadGun", vscode.CompletionItemKind.Method], ["mouseOver"], ["slowmotion"], ["frozen"], ["slowMotionSpeed"], ["ballsOnBoard"], ["viewX"], ["viewY"], ["paused"], ["pauseMenuVisibility"], ["ball", vscode.CompletionItemKind.Class], ["enumBalls", vscode.CompletionItemKind.Method]],
	{
		"enumPhysObjs" : makeArgs("function enumPhysObjs(callback : Function(obj : PhysObj)) : void", "the `callback` function can return a truthy value to cancel the enumeration.  \nthe reason these are enum functions instead of regular arrays is because this is how they actually do it in peggle (which is really weird)"),
		"click" : makeArgs("function click(mouseX : number, mouseY : number, mouseButton : number) : void", "simulates a click on the screen at the `mouseX` and `mouseY`, usually just shoots the ball"),
		"setSlowMotion" : makeArgs("function setSlowMotion(slowmotion : boolean, speed : number) : void", "this function sets `Board.slowmotion` = `slowmotion`, `Board.frozen` = 0, `Board.slowMotionSpeed` = `speed`  \nthe higher the speed, the faster the game runs during the slow motion!"),
		"reloadGun" : makeArgs("function reloadGun(void) : Ball", "this function reloads the gun and returns the newly reloaded ball  \nif there's a ball already loaded in the gun, this function will delete the old one!  \nif you call this function during a turn (after you've already shot), you might want to set `canShootBallDuringTurns` to true so you can shoot again~!"),
		"enumBalls" : makeArgs("function enumBalls(callback : Function(ball : Ball)) : void", "honestly it took a while for me to make this function simply because i actually didn't know board held an array of balls (but then again how would multiball work if that wasn't the case)  \nthe `callback` function can return a truthy value to cancel the enumeration.  \nthe reason these are enum functions instead of regular arrays is because this is how they actually do it in peggle (which is really weird)")
	},
);

registerOARFAS(
	"FloatingTextMgr",
	[],
	(args) => [["enumFloatingTextObjs", vscode.CompletionItemKind.Method]],
	{
		"enumFloatingTextObjs" : makeArgs("function enumFloatingTextObjs(callback : Function(floatingText : FloatingText)) : void", "the `callback` function can return a truthy value to cancel the enumeration.  \nthe reason these are enum functions instead of regular arrays is because this is how they actually do it in peggle (which is really weird)"),
	},
);

registerOARFAS(
	"WidgetManager",
	[],
	(args) => [["mouseX"], ["mouseY"], ["mouseButtons"], ["isKeyDown", vscode.CompletionItemKind.Method], ["arrowLeft"], ["arrowUp"], ["arrowRight"], ["arrowDown"]],
	{
		"isKeyDown" : makeArgs("function isKeyDown(keyCode : string | number) : boolean", "WidgetManager holds a big byte array for each keycode and this function checks to see if that key is currently being held (if the byte at that index is 1)  \ni added the `arrowLeft`, `arrowUp`, `arrowRight`, and `arrowDown` properties before i realized this lol"),
	},
);

registerOARFAS(
	"Gun",
	[],
	(args) => [["lastRotation"], ["ballX"], ["ballY"], ["offsetX"], ["offsetY"], ["idkBruh"], ["offsetBallRadius"], ["setNewBall", vscode.CompletionItemKind.Method], ["ball", vscode.CompletionItemKind.Class]],
	{
		"setNewBall" : makeArgs("function setNewBall(ball : Ball | number) : void", "this function replaces the old ball reference with the new `ball`  \nthis function is also called during Board's `reloadGun` method!"),
	},
);

registerOARFAS(
	"SoundMgr",
	[],
	(args) => [["playSoundSimple", vscode.CompletionItemKind.Method]],
	{
		"playSoundSimple" : makeArgs("function playSoundSimple(id : number, unknown = 1 : number) : void", "this function plays the sound specified by `id`  \n`id` can be one of the `SOUND_`* consts  \n`unknown` is usually 1 but nothing different happens when it's 0 so im not sure what it does (you'd think it was volume)"),
	},
);

function registerGlobalObjectSignature(globalName: string, objectName : string) : void {
    globalObjects.push({varName: globalName, props: objectMethodList[objectName].get(""), name: objectName});
}

registerGlobalObjectSignature("LogicMgr", "LogicMgr"); //back in the day you couldn't do this!
registerGlobalObjectSignature("Board", "Board");
registerGlobalObjectSignature("FloatingTextMgr", "FloatingTextMgr");
registerGlobalObjectSignature("WidgetManager", "WidgetManager");
registerGlobalObjectSignature("Gun", "Gun");
registerGlobalObjectSignature("SoundMgr", "SoundMgr");

//const functionRegex = /([A-z0-9_]+)\s*=\s*(?:\w*\.)?([A-z0-9_]+)\(/; //you lowkey could just replace [A-z0-9_] with \w
const functionRegex = /([A-z0-9_$]+)\s*=\s*(?:[A-z0-9_$]*\.)?([A-z0-9_$]+)\(/; //nevermind lol i just remembered js variables can have '$' in them

export function activate(context: vscode.ExtensionContext) {
    //class BrushObject implements JBSObjects {
    //    props: [["shit", vscode.CompletionItemKind.Method]];
    //}

    function calcDefinedObjects(document : vscode.TextDocument) {
        //definedObjects = globalObjects; //OOPS! this shit is NOT a copy!!!
        definedObjects = []; //structuredClone(globalObjects); //come on bruh
        Object.assign(definedObjects, globalObjects);
        console.log("defining objects...", document.lineCount*objectReturningInfo.length); //oops that old loop was kinda inefficient
        //for(let i = 0; i < document.lineCount; i++) {
        //    for(const orf of objectReturningInfo) {
        //        //const line = document.lineAt(i).text.replaceAll("   ", "");
        //        const text = document.lineAt(i).text;
        //        if(/*line*/text.includes(orf[0]+"(")) {
        //            /*
        //            //console.log(line.substring(line.indexOf(" ")+1, line.indexOf(" =")), orf[0], "line",i);
        //            //definedObjects.push({varName: line.substring(line.indexOf(" ")+1, line.indexOf(" =")), object: orf[1]});
        //            let tline = document.lineAt(i).text.replaceAll("    ", "");
        //            //const line = document.lineAt(i).text.replaceAll("   ", "");
        //            //if(tline.substring(0, 6) == "const ") {
        //            //    tline = tline.replace("const ", "");
        //            //}else if(tline.substring(0,4) == "var ") {
        //            //    tline = tline.replace("var ", "");
        //            //}else if(tline.substring(0,4) == "let ") {
        //            //    tline = tline.replace("let ", "");
        //            //}
        //            tline = tline.replace("const ", "").replace("var ", "").replace("let ", "");
        //            //console.log(tline.substring(0, tline.indexOf(" =")), orf[0], "line",i);
        //            */
        //            
        //            //damn typescript doesn't like that regex could be null or something idk
        //            //const [_, varName, funcName] = document.lineAt(i).text.match(/([A-z0-9_]+)\s*=\s*([A-z0-9_]+).*\(/); //yo typescript chill out bruh this is valid js
        //            const match = text.match(/([A-z0-9_]+)\s*=\s*([A-z0-9_]+.*)\(/); //damn i was tryna get the args too but idk if i can doo all that
        //            if(match) { //kys TS it shouldn't be null here anyways (well... technically)
        //                const varName: string = match[1];
        //                if(text.indexOf("//") != -1 && text.indexOf(varName) > text.indexOf("//")) {
        //                    console.log("lol this var is commented out!", varName);
        //                    continue;
        //                }
        //                const funcName: string = match[2]; //oops this has sometimes been wrong!
        //                const objectName: string = orf[1];
        //                const args: string = text.match(/\((.+)+\)/)?.[1] ?? "";
        //                //if(args == "") {
        //                    //console.log("args are \"\" something may or may not of happened", varName, funcName);
        //                //}
        //                console.log(args, varName, funcName, definedObjects.length);
        //                const props : SignatureInfo = objectMethodList[objectName].get(args);
        //                //console.log(varName, funcName, objectName, args, props);
        //                //let object = orf[1];
        //                //if(object) {
        //                //    object = object.testArgs(text.match(/\((.+)+\)/)[1]);
        //                //}
        //                definedObjects.push({varName/*: tline.substring(0, tline.indexOf(" ="))*/, props, name: objectName});
        //            }
        //        }
        //    }
        //}
        //console.log(definedObjects);
        for(let i = 0; i < document.lineCount; i++) {
            const match = document.lineAt(i).text.match(functionRegex);
            if(match) {
                const varName: string = match[1];
                const funcName: string = match[2];
                const index: number = objectReturningInfo.findIndex(([orifn]) => orifn == funcName); //object returning info function name
                //console.log(varName, funcName, index);
                if(index != -1) {
                    const orf = objectReturningInfo[index];
                    const objectName: string = orf[1];
                    //console.log("right before args what's the problem", document.lineAt(i).text);
                    //console.log("regex", document.lineAt(i).text.match(/\((.+)+\)/));
                    //const args: string = document.lineAt(i).text.match(/\((.+)+\)/)?.[1] ?? ""; //for some reason BOTH times it gets stuck on this line?
                    //GUYS
                    //i had NO IDEA that regex could get stuck in a loop if you put some dumb shit LMAO
                    const args: string = document.lineAt(i).text.match(/\((.*?)\)/)?.[1] ?? ""; //magnificent
                    const props: SignatureInfo = objectMethodList[objectName].get(args);
                    console.log(args, varName, funcName, definedObjects.length);
                    definedObjects.push({varName/*: tline.substring(0, tline.indexOf(" ="))*/, props, name: objectName});
                }
            }
        }
    }

	const signatureHelp = vscode.languages.registerSignatureHelpProvider('javascript', {
		provideSignatureHelp(document : vscode.TextDocument, position : vscode.Position, token : vscode.CancellationToken, sigcontext : vscode.SignatureHelpContext) {
			const line = document.lineAt(position).text;
            calcDefinedObjects(document);
			//if(!line.substring(0, line.indexOf("(")).includes(".")) 
			for(const object of definedObjects) {
				if(line.includes(object.varName)) {
					for(const method of object.props) {
						if(line.includes(method[0]+"(")) {
                            console.log("amy in the tardis,", object, method[0]); //time and relative dimension in space
							//const func = objectFunctions[method[0]];
							const func = objectMethodList[object.name].desc[method[0]];
                            const param = (line.slice(0, position.character).match(/,/g) || []).length;
							const sig = new vscode.SignatureInformation("", new vscode.MarkdownString(func.desc));//func.info, "typescript"));
							sig.parameters = [
								new vscode.ParameterInformation(func.args[param], new vscode.MarkdownString(func.info.replace(func.args[param], "**$&**")))
							];

							const sighelp = new vscode.SignatureHelp();
							sighelp.signatures = [sig];
							sighelp.activeSignature = 0;
							sighelp.activeParameter = 0;//param;
		
							return sighelp;
						}
						//if(method[1] == vscode.CompletionItemKind.Method && line.includes())
					}
				}
			}
			for(const func of funcs) {
				if(line.includes(func.name+"(")) { //finally getting the correct func LOL!
					const param = (line.slice(0, position.character).match(/,/g) || []).length;
					const sig = new vscode.SignatureInformation("", new vscode.MarkdownString(func.desc));//func.info, "typescript"));
					sig.parameters = [
						new vscode.ParameterInformation(func.args[param], new vscode.MarkdownString(func.info.replace(func.args[param], "**$&**")))
					];
					//for(const str of func.args) {
					//	sig.parameters.push(new vscode.ParameterInformation(str, new vscode.MarkdownString().appendCodeblock(str, "typescript")));
					//}
					//sig.parameters = [
					//	new vscode.ParameterInformation("a", "documentation2"),
					//	new vscode.ParameterInformation("b", "documentation3"),
					//	new vscode.ParameterInformation("c", "documentation4"),
					//];
					
					const sighelp = new vscode.SignatureHelp();
					sighelp.signatures = [sig];
					sighelp.activeSignature = 0;
					sighelp.activeParameter = 0;//param;
		
					return sighelp;
					//break;
				}
			}
		},
	});

	const hover = vscode.languages.registerHoverProvider('javascript', {
		provideHover(document : vscode.TextDocument, position : vscode.Position, token : vscode.CancellationToken) {
			//let string = "nuh uh";
            calcDefinedObjects(document);
			if(document.getWordRangeAtPosition(position) != undefined) {
				const shit : vscode.Range = document.getWordRangeAtPosition(position) as vscode.Range;
				const line = document.lineAt(position).text;
				const object = line.substring(shit.start.character, shit.end.character);
				let string = "sus";
				let additional = "\n";

				const markdown = new vscode.MarkdownString();
				//const addmarkdown = new vscode.MarkdownString();
				//const defs = [];
                console.log(object, line[shit.end.character], "\x07");
				if(line[shit.end.character] == "(") {
                    let quit = false;
                    for(const dObject of definedObjects) {
                        if(line.includes(dObject.varName) && !quit) {
                            console.log(line, dObject.varName);
                            for(const method of dObject.props) {
                                if(object == method[0] && line.includes(method[0])) { //lets go EndPaint(hwnd, ps) has hover AND signature
                                    console.log("quitting", method[0]);
                                    const func = objectMethodList[dObject.name].desc[method[0]];
                                    //const func = objectFunctions[method[0]];
                                    string = func.info;
                                    additional += func.desc;
                                    quit = true;
                                    //console.log(object.varName, string, additional);
                                    break;
                                }
                            }
                        }
                    }       
                    if(!quit) { 
                        for(const func of funcs) {
                            if(object.includes(func.name) && line.includes(func.name+"(")) {//func.name.includes(object)) {
                                string = func.info;
                                additional += func.desc;
                                break;
                            }
                        }
                    }
				}//else {
                 //   for(const dObj of definedObjects) {
                 //       if(dObj.varName == object) {
                 //           string = //uhhhh definedObjects don't hold the name of their creator function :sob:
                 //       }
                 //   }
                //}

                //console.log(string, additional);

				markdown.appendCodeblock(string, "typescript");//"print(...) : void", "javascript");
				markdown.appendMarkdown(additional);
				//defs.push(new vscode.Hover(markdown), new vscode.Hover(addmarkdown));
				const def = new vscode.Hover(markdown);
				return def;
			}
		},
	});

	const provider1 = vscode.languages.registerCompletionItemProvider('javascript', {

		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			// a simple completion item which inserts `Hello World!`
			//const simpleCompletion = new vscode.CompletionItem('Hello World!');

			// a completion item that inserts its text as snippet,
			// the `insertText`-property is a `SnippetString` which will be
			// honored by the editor.
			//const snippetCompletion = new vscode.CompletionItem('Good part of the day');
			//snippetCompletion.insertText = new vscode.SnippetString('Good ${1|morning,afternoon,evening|}. It is ${1}, right?');
			//const docs: any = new vscode.MarkdownString("Inserts a snippet that lets you select [link](x.ts).");
			//snippetCompletion.documentation = docs;
			//docs.baseUri = vscode.Uri.parse('http://example.com/a/b/c/');

			// a completion item that can be accepted by a commit character,
			// the `commitCharacters`-property is set which means that the completion will
			// be inserted and then the character will be typed.
			//const commitCharacterCompletion = new vscode.CompletionItem('console', vscode.CompletionItemKind.Variable);
			//commitCharacterCompletion.commitCharacters = ['.'];
			//commitCharacterCompletion.documentation = new vscode.MarkdownString('Press `.` to get `consoele.`');
			
            console.log("completions : 21");

			const completions:vscode.CompletionItem[] = [];

			for(const func of funcs) {
				const completion = new vscode.CompletionItem(func.name, func.type);//vscode.CompletionItemKind.Function);
				//completion.commitCharacters = ['.'];
				completion.detail = func.info;
				completions.push(completion);
			}

			for(const object of objects) {
				const completion = new vscode.CompletionItem(object.name, object.type);//vscode.CompletionItemKind.Function);
				//completion.commitCharacters = ['.'];
				completion.detail = object.info;
				completions.push(completion);
			}

			for(const macro of macros) {
				const completion = new vscode.CompletionItem(macro, vscode.CompletionItemKind.Constant);
				completions.push(completion);
			}

			//const commitCharacterCompletion = new vscode.CompletionItem("print", vscode.CompletionItemKind.Method);
			//commitCharacterCompletion.commitCharacters = ['.'];
			//commitCharacterCompletion.documentation = new vscode.MarkdownString("prints an object provided");
			//commitCharacterCompletion.detail = "siniegr";

			// a completion item that retriggers IntelliSense when being accepted,
			// the `command`-property is set which the editor will execute after 
			// completion has been inserted. Also, the `insertText` is set so that 
			// a space is inserted after `new`
			const commandCompletion = new vscode.CompletionItem('new');
			commandCompletion.kind = vscode.CompletionItemKind.Keyword;
			commandCompletion.insertText = 'new ';
			commandCompletion.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };

			completions.push(commandCompletion);

			// return all completion items as array
			return completions;
		}
	});

	const provider2 = vscode.languages.registerCompletionItemProvider(
		'javascript',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

				// get all text until the `position` and check if it reads `console.`
				// and if so then complete if `log`, `warn`, and `error`
                console.log("dot nottation");
				calcDefinedObjects(document);
				const linePrefix = document.lineAt(position).text.slice(0, position.character);
				for(const object of definedObjects) {
					if(linePrefix.endsWith(object.varName+".")) {
						const shit = [];
						for(const prop of object.props) {
							shit.push(new vscode.CompletionItem(prop[0], prop[1] || vscode.CompletionItemKind.Field));
						}
						return shit;
					}
					//break;
				}
				return undefined;
				//if (!linePrefix.endsWith('console.')) {
				//	return undefined;
				//}
//
				//return [
				//	new vscode.CompletionItem('log', vscode.CompletionItemKind.Method),
				//	new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
				//	new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
				//];
			}
		},
		'.' // triggered whenever a '.' is being typed
	);

	context.subscriptions.push(provider1, provider2, signatureHelp);
}

const macros:string[] = [ //macrosforjbsblueprints
	"ABILITY_SUPERGUIDE",
    "ABILITY_FLIPPERS",
    "ABILITY_MULTIBALL",
    "ABILITY_PYRAMID",
    "ABILITY_SPACEBLAST",
    "ABILITY_SPOOKYBALL",
    "ABILITY_ZENSHOT",
    "ABILITY_SHOTEXTENDER", //HIDDEN ABILITY!!!
    "ABILITY_FLOWERPOWER",
    "ABILITY_NUDGE", //HIDDEN ABILITY!!!
    "ABILITY_TIMEBOMB", //HIDDEN ABILITY!!!
    "ABILITY_FIREBALL",
    "ABILITY_WARRENSPECIAL",
    "PEG_BLUE",
    "PEG_ORANGE",
    "PEG_PURPLE",
    "PEG_GREEN",
    "MOVEMENT_NONE",
    "MOVEMENT_VERTICAL",
    "MOVEMENT_HORIZONTAL",
    "MOVEMENT_VERTICAL_HORIZONTAL",
    "MOVEMENT_INFINITY",
    "MOVEMENT_FIGURE_EIGHT",
    "MOVEMENT_HORIZONTAL_SEMICIRCLE",
    "MOVEMENT_VERTICAL_SEMICIRCLE",
    "MOVEMENT_ROTATE_AT_ORIGIN",
    "MOVEMENT_SMOOTH_ROTATE_AT_ORIGIN",
    "MOVEMENT_VERTICAL_SNAP",
    "MOVEMENT_HORIZONTAL_SNAP",
    "MOVEMENT_ROTATE_AROUND_ORIGIN",
    "LOGIC_EVENT_DEFAULT",
    "LOGIC_EVENT_START_TURN",
    "LOGIC_EVENT_END_TURN",
    "LOGIC_EVENT_GRANT_FREE_BALL",
    "LOGIC_EVENT_END_GAME",
    "LOGIC_EVENT_OPEN_PANE",
    "SOUND_MORNING",
    "SOUND_PEGHIT_LOW",
    "SOUND_PEGHIT",
    "SOUND_PEGHIT2",
    "SOUND_PEGHIT3",
    "SOUND_EXTRABALL",
    "SOUND_EXTRABALL2",
    "SOUND_EXTRABALL3",
    "SOUND_MISS",
    "SOUND_COINSPIN",
    "SOUND_COINSPIN_NO",
    "SOUND_FREEBALL",
    "SOUND_PENALTY",
    "SOUND_LEVELWON",
    "SOUND_LEVELDONE",
    "SOUND_LEVELLOST",
    "SOUND_POWERUP",
    "SOUND_AAH",
    "SOUND_MULTIBALL",
    "SOUND_PEGPOP",
    "SOUND_EXPLODE",
    "SOUND_BUTTON1",
    "SOUND_BUTTON2",
    "SOUND_MOUSEOVER",
    "SOUND_DING",
    "SOUND_POINTBOOST",
    "SOUND_TING",
    "SOUND_AWARD",
    "SOUND_APPLAUSE",
    "SOUND_SKILLSHOT",
    "SOUND_SPOOKYBALL2",
    "SOUND_SPOOKYBALL3",
    "SOUND_SPOOKYBALL4",
    "SOUND_BUBBLES",
    "SOUND_FLIP",
    "SOUND_BUCKETHIT",
    "SOUND_CANNONCOCK",
    "SOUND_CANNONSHOT",
    "SOUND_SCORECOUNTER",
    "SOUND_FLIPPERUP",
    "SOUND_FLIPPERDOWN",
    "SOUND_FLIPPERBOUNCE",
    "SOUND_RAINBOW",
    "SOUND_FIREWORKS1",
    "SOUND_FIREWORKS2",
    "SOUND_RICHOCHET",
    "SOUND_CYMBAL",
    "SOUND_SIGH",
    "SOUND_WOOSH",
    "SOUND_TEXT_WOOSH",
    "SOUND_WHISTLE",
    "SOUND_FEVERHIT",
    "SOUND_FIREBALLLOOP",
    "SOUND_FIREBALLSHOT",
    "SOUND_FIREBALLBOUNCE",
    "SOUND_POWERUP_GUIDE",
    "SOUND_POWERUP_MULTIBALL",
    "SOUND_POWERUP_PYRAMID",
    "SOUND_POWERUP_SPACEBLAST",
    "SOUND_POWERUP_FLIPPERS",
    "SOUND_POWERUP_SPOOKYBALL",
    "SOUND_POWERUP_FLOWERPOWER",
    "SOUND_POWERUP_LUCKYSPIN",
    "SOUND_POWERUP_FIREBALL",
    "SOUND_POWERUP_ZEN",
    "SOUND_GONG",
    "SOUND_SLOWMO",
    "SOUND_TYPING",
    "SOUND_TONELO",
    "SOUND_TONE",
    "SOUND_TONEHI",
    "SOUND_TONESUPERHI",
    "SOUND_STAMP",
    "SOUND_ADD_BALL",
    "SOUND_DIALOG_MOVE",
    "SOUND_FIREWORKPOP",
    "PHYS_HOLE",
    "PHYS_BALL",
    "PHYS_PEG",
    "PHYS_LINE",
    "PHYS_POLY",
    "PHYS_BRICK",
];