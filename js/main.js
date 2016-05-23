enchant();

window.onload = function () {
	var SCREEN_W = 480; // 解像度　幅
	var SCREEN_H = 320; // 解像度　高さ
	var hiscore = 0; //ハイスコア
	var SCORE_DIGIT = 6; //スコアの桁数
	var scoreSprite = new Sprite(256, 16); //スコア領域
	var hiscoreSprite = new Sprite(256, 16); //ハイスコア領域
	var game = new Game(SCREEN_W, SCREEN_H); // 表示領域の大きさを設定
	/*
	* 画面中央に表示
	*/
	var left = (window.innerWidth - (game.width * game.scale)) / 2;
	var enchantStage = document.getElementById('enchant-stage');
	enchantStage.style.position = "absolute";
	enchantStage.style.left = left + "px";
	game._pageX = left;

	game.preload(
		'./img/start.png',
		'./img/gameover.png',
		'./img/chara1.png',
		'./img/bg1.png',
		'./img/bg2.png',
		'./img/hurdle.png',
		'./img/igaguri.png',
		'./img/bird.png',
		'./img/chara2.png',
		'./img/number.png',
		'./img/score.png',
		'./img/hiscore.png'); // ゲームに使う素材を予め読み込み

	game.onload = function () { // ゲームの準備が整ったらメインの処理を実行します

		/**
		 * タイトルシーン
		 */
		var createStartScene = function () {

			var scene = new Scene(); // 新しいシーンを作る
			scene.backgroundColor = '#fcc800'; // シーンの背景色を設定

			// スタート画像設定
			var startImage = new Sprite(236, 48); // スプライトを作る
			startImage.image = game.assets['./img/start.png']; // 画像を設定
			startImage.x = 120; // 横位置調整
			startImage.y = 157; // 縦位置調整
			scene.addChild(startImage); // シーンに追加

			// タイトルラベル設定
			var title = new Label('RUNNNING BEAR'); // ラベルを作る
			title.width = SCREEN_W;
			title.textAlign = 'center'; // 文字を中央寄せ
			title.color = '#000000'; // 文字を黒色に
			title.x = 0; // 横位置調整
			title.y = 96; // 縦位置調整
			title.font = '44px sans-serif'; // 28pxのゴシック体にする
			scene.addChild(title); // シーンに追加

			// 説明ラベル設定
			var info = new Label('STARTを押して開始 / タッチでジャンプ'); // ラベルを作る
			info.width = SCREEN_W;
			info.textAlign = 'center'; // 文字を中央寄せ
			info.color = '#ffffff'; // 文字を白色に
			info.x = 0; // 横位置調整
			info.y = 222; // 縦位置調整
			info.font = '14px sans-serif'; // 28pxのゴシック体にする
			scene.addChild(info); // シーンに追加

			// スタート画像にタッチイベントを設定
			scene.addEventListener(Event.TOUCH_START, function (e) {
				console.log('hello world1');
				// 現在表示しているシーンをゲームシーンに置き換える
				game.replaceScene(createGameScene());
			});
			// スタート画像にタッチイベントを設定
			scene.addEventListener(Event.UP_BUTTON_DOWN, function (e) {
				console.log('hello world');
				// 現在表示しているシーンをゲームシーンに置き換える
				game.replaceScene(createGameScene());
			});

			// タイトルシーンを返します。
			return scene;

		};

		/**
		 * ゲームシーン
		 */
		var createGameScene = function () {

			//フレームの進行を初期化
			game.fps = 24; // ゲームの進行スピードを設定。
			var scroll = 0; // スクロール量を記録する変数
			var scoreNumberSprites = new Array(SCORE_DIGIT); //スコアの数値
			var hiscoreNumberSprites = new Array(SCORE_DIGIT); //ハイスコアの数値
			var speedLevelCount = 1; // スピードレベル
			var GROUND_LINE = 250; // 地平線の高さ(固定)
			var scrollSpeed = 10; // スクロールの速さ(難易度アップで変わる)
			var scrollSpeedBG = 10; // 背景スクロールの速さ(固定)
			var scrollSpeedLevel = 1; // 背景スクロールの速さ(難易度アップで変わる)
			var ENEMY_NUM = 4; // 敵の数(固定)
			var randomnum = -1;// 敵配置を決定するランダム数

			var scene = new Scene(); // 新しいシーンをつくる
			scene.backgroundColor = '#8cc820'; // シーンの背景色を設定

			// スクロールする背景1の設定
			var bg1 = new Sprite(SCREEN_W, SCREEN_H); // スプライトをつくる
			bg1.image = game.assets['./img/bg1.png']; // 画像を設定
			bg1.x = 0; // 横位置調整
			bg1.y = 0; // 縦位置調整
			scene.addChild(bg1); // シーンに追加

			// スクロールする背景2の設定
			var bg2 = new Sprite(SCREEN_W, SCREEN_H); // スプライトをつくる
			bg2.image = game.assets['./img/bg2.png']; // 画像を設定
			bg2.x = SCREEN_W; // 横位置調整 320px右に配置(bg1の右隣に隙間なく並べる)
			bg2.y = 0; // 縦位置調整
			scene.addChild(bg2); // シーンに追加

			// ハードルの設定
			var hurdle = new Sprite(50, 100); // スプライトをつくる
			hurdle.image = game.assets['./img/hurdle.png']; // 画像を設定
			hurdle.x = -hurdle.width; // 横位置調整 画面外に隠しておく
			hurdle.y = GROUND_LINE - hurdle.height; // 縦位置調整 ハードルの下端を地面の高さと合わせる
			scene.addChild(hurdle); // シーンに追加

			// いがぐりの設定
			var igaguri = new Sprite(42, 31); // スプライトをつくる
			igaguri.image = game.assets['./img/igaguri.png']; // 画像を設定
			igaguri.x = -igaguri.width; // 横位置調整 画面外に隠しておく
			igaguri.y = GROUND_LINE - igaguri.height; // 縦位置調整 いがぐり下端を地面の高さと合わせる
			scene.addChild(igaguri); // シーンに追加

			// 鳥の設定
			var bird = new Sprite(64, 44); // スプライトをつくる
			bird.image = game.assets['./img/bird.png']; // 画像を設定
			bird.x = -bird.width; // 鳥を左側の画面外に隠します
			bird.y = 120; // 鳥の飛ぶ高さを設定します
			scene.addChild(bird); // シーンに鳥を追加します

			// 豚の設定
			var gurasanpig = new Sprite(32, 32); // スプライトをつくる
			gurasanpig.image = game.assets['./img/chara2.png']; // 画像を設定
			gurasanpig.x = -gurasanpig.width; // 横位置調整 画面外に隠しておく
			gurasanpig.y = GROUND_LINE - gurasanpig.height; // 縦位置調整 豚下端を地面の高さと合わせる
			scene.addChild(gurasanpig); // シーンに追加

			// スコア文字画像
			scoreSprite.image = game.assets['./img/score.png'];
			scoreSprite.x = 8;
			scoreSprite.y = 10;
			scene.addChild(scoreSprite);

			// ハイスコア文字画像
			hiscoreSprite.image = game.assets['./img/hiscore.png'];
			hiscoreSprite.x = 8;
			hiscoreSprite.y = 32;
			scene.addChild(hiscoreSprite);

			// くまの設定
			var kuma = new Sprite(32, 32); // スプライトをつくる
			kuma.image = game.assets['./img/chara1.png']; // 画像を設定
			kuma.x = 80; // 横位置調整 画面左側に配置
			kuma.y = GROUND_LINE - kuma.height; // 縦位置調整 くまの下端を地面の高さに合わせる
			scene.addChild(kuma); // シーンに追加

			// くまの当たり判定用スプライトの設定
			var kuma_hit = new Sprite(1, 1); // スプライトをつくる(幅1, 高さ1)
			// kuma_hit.image =                        // 画像は設定しない（透明）
			kuma_hit.x = kuma.x + kuma.width / 2; // 横位置調整 くまの左右中央に配置
			kuma_hit.y = kuma.y + kuma.height / 2; // 縦位置調整くまの上下中央に配置
			scene.addChild(kuma_hit); // シーンに追加

			var s;
			// スコアの数字
			for (i = 0; i < SCORE_DIGIT; i++) {
				s = new Sprite(13, 16);
				s.image = game.assets['./img/number.png'];
				s.x = 184 - 14 * i;
				s.y = 4;
				scene.addChild(s);
				scoreNumberSprites[i] = s;
			}
			//ハイスコアの数字
			for (i = 0; i < SCORE_DIGIT; i++) {
				s = new Sprite(13, 16);
				s.image = game.assets['./img/number.png'];
				s.x = 184 - 14 * i;
				s.y = 26;
				scene.addChild(s);
				hiscoreNumberSprites[i] = s;
			}

			// くまがやられた関数
			var kumaDead = function () {
				kuma.frame = 3; // くまを涙目にする
				game.pushScene(createGameoverScene(scroll)); // ゲームオーバーシーンをゲームシーンに重ねる(push)
			}
			
			// 毎フレームイベントをシーンに追加
			scene.addEventListener(Event.ENTER_FRAME, function () {

				scroll += scrollSpeed; // 走った距離を記録
				//scoreLabel.text = scroll.toString() + '㍍走破'; // スコア表示を更新
				// スクロールした量によって得点get
				if (scroll > hiscore) {
				hiscore = scroll;
				}
				//スコア表示
				for (i = 0; i < SCORE_DIGIT; i++) {
					scoreNumberSprites[i].frame = (scroll / (Math.pow(10, i)) % 10);
					hiscoreNumberSprites[i].frame = (hiscore / (Math.pow(10, i)) % 10);
				}
				/*
				* 500m走るごとに出現させる敵をランダムで決定する。
				*/
				if (scroll % 500 === 0) {
				randomnum = getRandomInt(0, ENEMY_NUM - 1);
				}
				
				//console.log('randomnum = ' + randomnum);
				//console.log('randomnum / 4 = ' + randomnum % 4);
				// 障害物の出現タイミングの設定
				if (randomnum % ENEMY_NUM === 0) {
					gurasanpig.x = SCREEN_W; // 豚を右端に移動(出現)
					bird.y = GROUND_LINE - bird.height - 10;//鳥を高い位置に変更
					randomnum = -1;
				}
				if (randomnum % ENEMY_NUM === 1) {
					hurdle.x = SCREEN_W; // ハードルを右端に移動(出現)
					bird.y = 120;
					randomnum = -1;
				}
				if (randomnum % ENEMY_NUM === 2) {
					igaguri.x = SCREEN_W; // いがぐりを右端に移動(出現)
					bird.y = GROUND_LINE - bird.height - 10;//鳥を低い位置に変更
					randomnum = -1;
				}
				if (randomnum % ENEMY_NUM === 3) {
					bird.x = SCREEN_W; // 鳥を右端に移動(出現)
					randomnum = -1;
				}

				if (gurasanpig.x > -gurasanpig.width) { // 豚が出現している(画面内にある)とき
					gurasanpig.x -= scrollSpeed * 1.3 * scrollSpeedLevel; // 豚をスクロール
					if (gurasanpig.intersect(kuma_hit)) { // 豚とくまがぶつかったとき
						kumaDead(); // くまがやられた関数を実行
					}
				}
				// 障害物のスクロールとくまとの接触の設定
				if (hurdle.x > -hurdle.width) { // ハードルが出現している(画面内にある)とき
					hurdle.x -= scrollSpeed * scrollSpeedLevel; // ハードルをスクロール
					if (hurdle.intersect(kuma_hit)) { // ハードルとくまがぶつかったとき
						kumaDead(); // くまがやられた関数を実行
					}
				}
				if (igaguri.x > -igaguri.width) { // いがぐりが出現している(画面内にある)とき
					igaguri.x -= scrollSpeed * scrollSpeedLevel; // いがぐりをスクロール
					if (igaguri.intersect(kuma_hit)) { // いがぐりとくまがぶつかったとき
						kumaDead(); // くまがやられた関数を実行
					}
				}

				if (bird.x > -bird.width) { // 鳥が出現している(画面内にある)とき
					bird.x -= scrollSpeed * 1.2 * scrollSpeedLevel; // 鳥を1.2倍速でスクロール
					if (bird.frame > 0) { // 鳥のフレーム番号を0, 1, 0, 1と切り替えて羽ばたかせる
						bird.frame = 0;
					} else {
						bird.frame = 1;
					}
					if (bird.intersect(kuma_hit)) { // 鳥とくまがぶつかったとき
						kumaDead(); // くまがやられた関数を実行
					}
				}
				//豚を歩かせるアニメーション
				gurasanpig.frame = gurasanpig.age % 2;

				// くまのフレームを0, 1, 2, 0, 1, 2..と繰り返す
				// 正確には0, 1, 2, 1, 0, 1, 2, 1, 0, 1...ですが、
				// 0, 1, 2, 0, 1, 2...でも十分走っているように見えるためよいものとします
				kuma.frame++;
				if (kuma.frame > 2) {
					kuma.frame = 0;
				}

				// 当たり判定用スプライトをくまの上下中心に置く
				kuma_hit.x = kuma.x + kuma.width / 2;
				kuma_hit.y = kuma.y + kuma.height / 2;
				//console.log('scroll / 2500 = ' + (scroll / 2500));
				//console.log('speedLevelCount = ' + speedLevelCount);
				console.log('game.fps = ' + game.fps);

				//2500mごとに難易度を上げる
				if ((scroll / 2500) > speedLevelCount) {
					//console.log('scrollSpeed IN');
					//最初はfpsを調整して難易度を上げる。（くまの動き含め画面全体的に速くさせるため）
					if (game.fps <= 30) { //scrollSpeed += 2;
						//console.log('scrollSpeed <= 30');
						game.fps += 5;
						speedLevelCount++;
					}
					//fps30を超えたら敵の動きだけ難易度を上げる。
					else if(game.fps > 30) {
					console.log('game.fps > 30');
					scrollSpeedLevel += 0.2;
					speedLevelCount++;
					}

				}
				// 背景をスクロールさせる。元の背景ちらつき防止のためスクロール変数を別にした。
				bg1.x -= scrollSpeedBG; // 背景1をスクロール
				bg2.x -= scrollSpeedBG; // 背景2をスクロール

				if (bg1.x <= -SCREEN_W) { // 背景1が画面外に出たら
					bg1.x = SCREEN_W; // 画面右端に移動
					//console.log('out bg1.x = ' + bg1.x);
				}
				if (bg2.x <= -SCREEN_W) { // 背景2が画面外に出たら
					bg2.x = SCREEN_W; // 画面右端に移動
					//console.log('out bg2.x = ' + bg2.x);
				}

			});

			// シーン全体にタッチイベントを追加
			scene.addEventListener(Event.TOUCH_START, function (e) {
				// くまをジャンプさせる
				kuma.tl.moveBy(0, -120, 8, enchant.Easing.CUBIC_EASEOUT) // 12フレームかけて現在の位置から上に120px移動
				.moveBy(0, 120, 8, enchant.Easing.CUBIC_EASEIN); // 12フレームかけて現在の位置から下に120px移動
			});
			scene.addEventListener(Event.UP_BUTTON_DOWN, function (e) {
				// くまをジャンプさせる
				kuma.tl.moveBy(0, -120, 8, enchant.Easing.CUBIC_EASEOUT) // 12フレームかけて現在の位置から上に120px移動
				.moveBy(0, 120, 8, enchant.Easing.CUBIC_EASEIN); // 12フレームかけて現在の位置から下に120px移動
			});
			//ゲームシーンを返します
			return scene;
		}

		/**
		 * ゲームオーバーシーン
		 *
		 * ゲームオーバーシーンを作り、返す関数です。
		 */
		var createGameoverScene = function (scroll) {

			var scene = new Scene(); // 新しいシーンを作る
			scene.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // シーンの背景色を設定

			// ゲームオーバー画像を設定
			var gameoverImage = new Sprite(189, 97); // スプライトを作る
			gameoverImage.image = game.assets['./img/gameover.png']; // 画像を設定
			gameoverImage.x = 140; // 横位置調整
			gameoverImage.y = 140; // 縦位置調整
			scene.addChild(gameoverImage); // シーンに追加

			// リトライラベルを設定
			var retryLabel = new Label('Try AGAIN!!'); // スプライトを作る
			retryLabel.width = SCREEN_W; // 幅を設定
			retryLabel.textAlign = 'center'; // 文字を中央寄せ
			retryLabel.color = '#ffffff'; // 文字を白色に
			retryLabel.x = 0; // 横位置調整
			retryLabel.y = 250; // 縦位置調整
			retryLabel.font = '36px sans-serif'; // 28pxのゴシック体にする
			scene.addChild(retryLabel); // シーンに追加

			// スコア表示用ラベルの設定
			var scoreLabel = new Label(scroll.toString() + ' M'); // ラベルを作る
			scoreLabel.width = SCREEN_W; // 幅を設定
			scoreLabel.textAlign = 'center'; // 文字を中央寄せ
			scoreLabel.color = '#ffffff'; // 文字を白色に
			scoreLabel.x = 0; // 横位置調整
			scoreLabel.y = 40; // 縦位置調整
			scoreLabel.font = '96px sans-serif'; // 28pxのゴシック体にする
			scene.addChild(scoreLabel); // シーンに追加

			// リトライボタンにタッチイベントを追加する
			scene.addEventListener(Event.TOUCH_END, function () {
				game.popScene(); // このシーンを剥がす（pop）
				game.replaceScene(createStartScene()); // ゲームシーンをタイトルシーンと入れ替える(replace)
			});
			scene.addEventListener(Event.UP_BUTTON_DOWN, function () {
				game.popScene(); // このシーンを剥がす（pop）
				game.replaceScene(createStartScene()); // ゲームシーンをタイトルシーンと入れ替える(replace)
			});

			// ゲームオーバーシーンを返します。
			return scene;

		};

		// ゲームの_rootSceneをスタートシーンに置き換える
		game.replaceScene(createStartScene());

	}

	game.start(); // ゲームをスタートさせます

}

// min から max までの乱整数を返す関数
// Math.round() を用いると、非一様分布になります!
function getRandomInt(min, max) {
  return Math.floor( Math.random() * (max - min + 1) ) + min;
}
