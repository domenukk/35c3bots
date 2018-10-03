import {SyntaxError, parse} from "./Parser";
import {TextMarker} from "../node_modules/@types/codemirror/index";
import {Input, TimeKeeper} from "./Utils";

export module paperbots {
	export class Compiler {
		parse(input: string) {
			return parse(input);
		}
	}

	export class Editor {
		private editor: CodeMirror.Editor;
		private canvas: Canvas;
		private compiler: Compiler;

		constructor(canvasElement: HTMLCanvasElement, private editorElement: HTMLElement, private compilerOutput: HTMLElement) {
			this.compiler = new Compiler();
			this.canvas = new Canvas(canvasElement);
			this.editor = CodeMirror(editorElement, {
				tabSize: 3,
				indentUnit: 3,
				indentWithTabs: true,
				lineNumbers: true,
				gutters: ["gutter-breakpoints", "CodeMirror-linenumbers"],
				fixedGutter: true,
				extraKeys: {
					"Tab": "indentAuto"
				}
			});
			this.editor.getDoc().setValue(window.localStorage.getItem("editor-content") || "");

			var markers = Array<TextMarker>();
			var compile = () => {
				try {
					let result = this.compiler.parse(this.editor.getDoc().getValue());
					compilerOutput.innerHTML = JSON.stringify(result, null, 2);
					markers.forEach(marker => marker.clear());
					markers.length = 0;
				} catch (e) {
					markers.forEach(marker => marker.clear());
					markers.length = 0;
					let err = (e as SyntaxError);
					let loc = err.location;
					let from = {line: loc.start.line - 1, ch: loc.start.column - 1 - (loc.start.line == loc.end.line && loc.start.column == loc.end.column ? 1 : 0)};
					let to = {line: loc.end.line - 1, ch: loc.end.column - 1};
					markers.push(this.editor.getDoc().markText(from, to, { className: "compiler-error", title: err.message}));
					compilerOutput.innerHTML = loc.start.line + ":" + loc.start.column + ": " + err.message;
				}
			}

			this.editor.on("change", (instance, change) => {
				compile();
				window.localStorage.setItem("editor-content", this.editor.getDoc().getValue());
			});

			this.editor.on("gutterClick", function(cm, n) {
				let info = cm.lineInfo(n);
				cm.setGutterMarker(n, "gutter-breakpoints", info.gutterMarkers ? null : makeMarker());
			});

			function makeMarker() {
				let marker = $(`
				<svg height="15" width="15">
					<circle cx="7" cy="7" r="7" stroke-width="1" fill="#cc0000" />
			  	</svg>
				`);
				return marker[0];
			}

			compile();
		}
	}

	interface ImageAsset {
		image: HTMLImageElement;
		url: string;
	}

	class AssetManager {
		private toLoad = new Array<ImageAsset>();
		private loaded = {};
		private error = {};

		loadImage(url: string) {
			var img = new Image();
			var asset: ImageAsset = { image: img, url: url };
			this.toLoad.push(asset);
			img.onload = () => {
				this.loaded[asset.url] = asset;
				let idx = this.toLoad.indexOf(asset);
				if (idx >= 0) this.toLoad.splice(idx, 1);
				console.log("Loaded image " + url);
			}
			img.onerror = () => {
				this.loaded[asset.url] = asset;
				let idx = this.toLoad.indexOf(asset);
				if (idx >= 0) this.toLoad.splice(idx, 1);
				console.log("Couldn't load image " + url);
			}
			img.src = url;
		}

		getImage(url: string): HTMLImageElement {
			return (this.loaded[url] as ImageAsset).image;
		}

		hasMoreToLoad() {
			return this.toLoad.length;
		}
	}


	export class Wall { }
	export class NumberTile { constructor (public readonly value: number) { } }
	export class LetterTile { constructor (public readonly value: string) { } }
	export type WorldObject = Wall | NumberTile | LetterTile;

	enum RobotAction {
		Forward,
		TurnLeft,
		TurnRight,
		None
	}

	export class Robot {
		static readonly FORWARD_DURATION = 1;
		static readonly TURN_DURATION = 1;
		x = 0;
		y = 15;
		dirX = 1;
		dirY = 0;
		angle = 0;
		action = RobotAction.None;

		actionTime = 0;
		startX = 0;
		startY = 0
		targetX = 0;
		targetY = 0;
		startAngle = 0;
		targetAngle = 0;

		constructor(private world: World) { }

		turnLeft () {
			this.angle = this.angle - 90;
			let temp = this.dirX;
			this.dirX = -this.dirY;
			this.dirY = temp;
		}

		setAction(action: RobotAction) {
			if (this.action != RobotAction.None) {
				throw new Error("Can't set action while robot is executing previous action.");
			}
			this.action = action;
			switch (action) {
			case RobotAction.Forward:
				this.startX = this.x;
				this.startY = this.y;
				this.targetX = this.x + this.dirX;
				this.targetY = this.y + this.dirY;
				console.log(this.targetX + ", " + this.targetY);
				if (this.world.getTile(this.targetX, this.targetY) instanceof Wall) {
					this.targetX = this.startX;
					this.targetY = this.startY;
				}
				break;
			case RobotAction.TurnLeft: {
				this.startAngle = this.angle;
				this.targetAngle = this.angle - 90;
				let temp = this.dirX;
				this.dirX = -this.dirY;
				this.dirY = temp;
				console.log(this.targetAngle);
				break;
			}
			case RobotAction.TurnRight: {
				this.startAngle = this.angle;
				this.targetAngle = this.angle + 90;
				let temp = this.dirX;
				this.dirX = this.dirY;
				this.dirY = -temp;
				console.log(this.targetAngle);
				break;
			}
			}
			this.actionTime = 0
		}

		update (delta: number): boolean {
			this.actionTime += delta;
			switch (this.action) {
				case RobotAction.Forward: {
					let percentage = this.actionTime / Robot.FORWARD_DURATION;
					if (percentage >= 1) {
						this.action = RobotAction.None;
						this.x = this.targetX;
						this.y = this.targetY;
					} else {
						this.x = this.startX + (this.targetX - this.startX) * percentage;
						this.y = this.startY + (this.targetY - this.startY) * percentage;
					}
					break;
				}
				case RobotAction.TurnLeft:
				case RobotAction.TurnRight: {
					let percentage = this.actionTime / Robot.TURN_DURATION;
					if (percentage >= 1) {
						this.action = RobotAction.None;
						this.angle = this.targetAngle;
					} else {
						this.angle = this.startAngle + (this.targetAngle - this.startAngle) * percentage;
					}
					break;
				}
			}
			return this.action == RobotAction.None;
		}
	}

	export class World {
		static WORLD_SIZE = 16;
		tiles = Array<WorldObject>(16 * 16);
		robot = new Robot(this);
		private time = new TimeKeeper();

		constructor () {
			for (var i = 0; i < 10; i++) {
				this.setTile(i, 2, new Wall());
			}
			this.setTile(1, 0, new Wall());
			this.setTile(2, 2, new NumberTile(12));

			let hello = "Hello world.";
			for (var i = 0; i < hello.length; i++) {
				this.setTile(4 + i, 4, new LetterTile(hello.charAt(i)));
			}
		}

		getTile (x: number, y: number): WorldObject {
			x = x | 0;
			y = y | 0;
			if (x < 0 || x >= World.WORLD_SIZE) return new Wall();
			if (y < 0 || y >= World.WORLD_SIZE) return new Wall();
			return this.tiles[x + y * World.WORLD_SIZE];
		}

		setTile (x: number, y: number, tile: WorldObject) {
			x = x | 0;
			y = y | 0;
			if (x < 0 || x >= World.WORLD_SIZE) return;
			if (y < 0 || y >= World.WORLD_SIZE) return;
			this.tiles[x + y * World.WORLD_SIZE] = tile;
		}

		lastWasTurn = false;
		update () {
			this.time.update();
			let delta = this.time.delta;
			this.robot.update(delta);
		}
	}

	class Canvas {
		private canvas: HTMLCanvasElement;
		private world = new World();
		private ctx: CanvasRenderingContext2D;
		private assets = new AssetManager();
		private selectedTool = "Robot";
		private input: Input;
		private lastWidth = 0;
		private cellSize = 0;
		private drawingSize = 0;

		constructor(private canvasContainer: HTMLElement) {
			let container = $(canvasContainer);
			this.canvas = container.find("#pb-canvas")[0] as HTMLCanvasElement;
			this.ctx = this.canvas.getContext("2d");
			this.assets.loadImage("img/wall.png");
			this.assets.loadImage("img/floor.png");
			this.assets.loadImage("img/robot.png");
			requestAnimationFrame(() => { this.draw(); });

			let tools = container.find("#pb-canvas-tools input");
			for (var i = 0; i < tools.length; i++) {
				$(tools[i]).click((tool) => {
					let value = (tool.target as HTMLInputElement).value;
					tools.removeClass("selected");
					$(tool.target).addClass("selected");
					this.selectedTool = value;
				});
			}

			this.input = new Input(this.canvas);
			this.input.addListener({
				down: (x, y) => {
					let cellSize = this.cellSize;
					x = ((x / cellSize) | 0) - 1;
					y = ((this.drawingSize - y) / cellSize) | 0;

					if (this.selectedTool == "Wall") {
						this.world.setTile(x, y, new Wall());
					} else if (this.selectedTool == "Floor") {
						this.world.setTile(x, y, null);
					}
				},
				up: (x, y) => {
					let cellSize = this.cellSize;
					x = ((x / cellSize) | 0) - 1;
					y = ((this.drawingSize - y) / cellSize) | 0;

					if (this.selectedTool == "Wall") {
						this.world.setTile(x, y, new Wall());
					} else if (this.selectedTool == "Floor") {
						this.world.setTile(x, y, null);
					} else if (this.selectedTool == "Number") {
						var number = null;
						while (number == null) {
							number = prompt("Please enter a number between 0-99.", "0");
							if (!number) return;
							try {
								number = parseInt(number, 10);
								if (number < 0 || number > 99) {
									alert("The number must be between 0-99.");
									number = null;
								}
							} catch (e) {
								alert("The number must be between 0-99.");
								number = null;
							}
						}
						this.world.setTile(x, y, new NumberTile(number));
					} else if (this.selectedTool == "Letter") {
						var letter = null;
						while (letter == null) {
							letter = prompt("Please enter a letter", "a");
							if (!letter) return;

							letter = letter.trim();
							if (letter.length != 1) {
								alert("Only a single letter is allowed.");
								letter = null;
							}
						}
						this.world.setTile(x, y, new LetterTile(letter));
					} else if (this.selectedTool == "Robot") {
						if (this.world.robot.x != x || this.world.robot.y != y) {
							this.world.robot.x = Math.max(0, Math.min(World.WORLD_SIZE - 1, x));
							this.world.robot.y = Math.max(0, Math.min(World.WORLD_SIZE - 1, y));
						} else {
							this.world.robot.turnLeft();
						}
					}
				},
				moved: (x, y) => {
					let cellSize = this.cellSize;
					x = ((x / cellSize) | 0) - 1;
					y = ((this.drawingSize - y) / cellSize) | 0;
				},
				dragged: (x, y) => {
					let cellSize = this.cellSize;
					x = ((x / cellSize) | 0) - 1;
					y = ((this.drawingSize - y) / cellSize) | 0;

					if (this.selectedTool == "Wall") {
						this.world.setTile(x, y, new Wall());
					} else if (this.selectedTool == "Floor") {
						this.world.setTile(x, y, null);
					} else if (this.selectedTool == "Robot") {
						this.world.robot.x = Math.max(0, Math.min(World.WORLD_SIZE - 1, x));
						this.world.robot.y = Math.max(0, Math.min(World.WORLD_SIZE - 1, y));
					}
				}
			});
		}

		setWorld(world: World) {
			this.world = world;
		}

		getWorld (): World {
			return this.world;
		}

		draw () {
			requestAnimationFrame(() => { this.draw(); });

			this.world.update();

			let ctx = this.ctx;
			let canvas = this.canvas;
			if (this.lastWidth != canvas.clientWidth) {
				canvas.width = canvas.clientWidth;
				canvas.height = canvas.clientWidth;
				this.lastWidth = canvas.width;
				this.cellSize = canvas.width / (World.WORLD_SIZE + 1);
				this.drawingSize = this.cellSize * World.WORLD_SIZE;
			}

			ctx.fillStyle = "#eeeeee";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			this.drawGrid();
			if (!this.assets.hasMoreToLoad()) {
				this.drawWorld();
			}
		}

		drawImage (img: HTMLImageElement, x: number, y: number, w: number, h: number) {
			this.ctx.drawImage(img, x, this.drawingSize - y - h, w, h);
		}
		drawRotatedImage (img: HTMLImageElement, x: number, y: number, w: number, h: number, angle: number) {
			this.ctx.save();
			this.ctx.translate(x + w / 2, this.drawingSize - y - h + h / 2);
			this.ctx.rotate(Math.PI / 180 * angle);
			this.ctx.drawImage(img, -w/2, -h/2, w, h);
			this.ctx.restore();
		}

		drawText(text: string, x: number, y: number, color = "#000000") {
			let ctx = this.ctx;
			ctx.fillStyle = color;
			ctx.font = this.cellSize * 0.5 + "pt monospace";
			let metrics = ctx.measureText(text);
			ctx.fillText(text, x + this.cellSize / 2 - metrics.width / 2, this.drawingSize - y - this.cellSize / 4);
		}

		drawWorld () {
			let ctx = this.ctx;
			let canvas = this.canvas;
			let cellSize = this.cellSize;
			let drawingSize = this.drawingSize;

			ctx.save();
			ctx.translate(this.cellSize, 0);

			for (var y = 0; y < drawingSize; y += cellSize) {
					for (var x = 0; x < drawingSize; x += cellSize) {
					var img = null;
					let wx = (x / cellSize);
					let wy = (y / cellSize);
					let obj = this.world.getTile(wx, wy);
					if (obj instanceof Wall) {
						img = this.assets.getImage("img/wall.png");
					} else if (obj instanceof NumberTile) {
						this.drawText("" + obj.value, x, y);
					} else if (obj instanceof LetterTile) {
						this.drawText("" + obj.value, x, y);
					}

					if (img) this.drawRotatedImage(img, x, y, cellSize, cellSize, 0);
				}
			}

			let robot = this.world.robot;
			this.drawRotatedImage(this.assets.getImage("img/robot.png"), robot.x * cellSize + cellSize * 0.05, robot.y * cellSize + cellSize * 0.05, cellSize * 0.9, cellSize * 0.9, robot.angle);
			ctx.beginPath();
			ctx.strokeStyle = "#ff0000";
			ctx.moveTo((robot.x + 0.5) * cellSize, drawingSize - (robot.y + 0.5) * cellSize);
			ctx.lineTo((robot.x + 0.5 + robot.dirX) * cellSize, drawingSize - (robot.y + robot.dirY + 0.5) * cellSize);
			ctx.stroke();
			ctx.restore();
		}

		drawGrid () {
			let ctx = this.ctx;
			let canvas = this.canvas;

			for (var y = 0; y < World.WORLD_SIZE; y++) {
				this.drawText("" + y, 0, y * this.cellSize, "#aaaaaa");
			}

			for (var x = 0; x < World.WORLD_SIZE; x++) {
				this.drawText("" + x, x * this.cellSize + this.cellSize, -this.cellSize, "#aaaaaa");
			}

			ctx.save();
			ctx.translate(this.cellSize, 0);
			ctx.strokeStyle = "#7f7f7f";
			ctx.beginPath();
			ctx.setLineDash([2, 2]);
			for (var y = 0; y <= World.WORLD_SIZE; y++) {
				ctx.moveTo(0, y * this.cellSize);
				ctx.lineTo(this.drawingSize, y * this.cellSize);
			}
			for (var x = 0; x <= World.WORLD_SIZE; x++) {
				ctx.moveTo(x * this.cellSize, 0);
				ctx.lineTo(x * this.cellSize, this.drawingSize);
			}
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.restore()
		}
	}
}