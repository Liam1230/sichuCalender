<template>
<v-container fill-height fill-width fluid grid-list-xl>
	<v-layout justify-center row wrap>
		<v-flex xs12 md12>
			<v-card>
				<v-card-text>
					<v-select v-model="selectPatern" :items="paterns" label="パターンを選択">
					</v-select>
				</v-card-text>
				<v-date-picker v-model="picker" type="month" color="cyan lighten-1" locale="jp-ja" :day-format="date => new Date(date).getDate()"></v-date-picker>
				<v-card-actions>
					<v-btn v-on:click="showPreview()">プレビュー</v-btn>
					<v-btn v-on:click="downloadCanvas()">ダウンロード</v-btn>
				</v-card-actions>
			</v-card>
			<v-card dark>
				<v-layout class="justify-center my-5">
					<canvas id="preview" class="my-5" width="583" height="827"></canvas>
				</v-layout>
			</v-card>
		</v-flex>
	</v-layout>
	<a id="hiddenLink" download="canvas.png">link</a>
</v-container>
</template>

<script>
import CoreToolbar from '~/components/Toolbar.vue'

class Vector2{
	constructor(x,y){
			this.x=x;
			this.y=y;
	}
	
	plus(vec){
			var tmp = new Vector2(this.x + vec.x, this.y+ vec.y);
			return tmp;
	}
	
	add(vec){
			this.x += vec.x;
			this.y += vec.y;
			return this;
	}
}

const YEAR_POS = new Vector2(245,120);
const MONTH_EN_POS = new Vector2(290,147);
const MONTH_POS = new Vector2(265,90);

const PIC_POS = new Vector2(10,10);
const HYOU_POS = new Vector2(360,35);

const WEEKFRAME_OFFSET = new Vector2(0,-30)

const FRAME_LU = new Vector2(30,200);
const FRAME_LD = new Vector2(30,800);
const FRAME_RD = new Vector2(550,800);
const FRAME_RU = new Vector2(550,200);

const WEEK_OFFSET = new Vector2(12,-7);
const DAY_OFFSET = new Vector2(5,25);
const KANSHI_OFFSET = new Vector2(5,55);
const UNSEI_OFFSET = new Vector2(33,20);
const ICON_OFFSET = new Vector2(40,35);

const ROKUJU_KANSHI = [
		'甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉','甲戌','乙亥',
		'丙子','丁丑','戊寅','己卯','庚辰','辛巳','壬午','癸未','甲申','乙酉','丙戌','丁亥',
		'戊子','己丑','庚寅','辛卯','壬辰','癸巳','甲午','乙未','丙申','丁酉','戊戌','己亥',
		'庚子','辛丑','壬寅','癸卯','甲辰','乙巳','丙午','丁未','戊申','己酉','庚戌','辛亥',
		'壬子','癸丑','甲寅','乙卯','丙辰','丁巳','戊午','己未','庚申','辛酉','壬戌','癸亥'
];

const UNSEI = [
		'飛躍','絶好調','頂点','忍耐','陰徳','修行',
		'夜明け','進化','決意','休息','青春','空転'
];

const MONTH_EN = [
		'January','February','March','April','May','June',
		'July','August','September','October','November','December'
];

const STD_DAY = new Date(2020,1-1,1);
const STD_KANSHI = 39;

/**
 * 指定した年月のカレンダー情報を返す
 * @param {number} year  - 年の指定
 * @param {number} month - 月の指定
 */
function get_month_calendar(year, month) {
		var firstDate = new Date(year, (month - 1), 1); // 指定した年月の初日の情報
		var lastDay = new Date(year, (firstDate.getMonth() + 1), 0).getDate(); // 指定した年月の末日
		var weekday = firstDate.getDay(); // 指定した年月の初日の曜日
 
		var calendarData = []; // カレンダーの情報を格納
		var weekdayCount = weekday; // 曜日のカウント用
		for (var i = 0; i < lastDay; i++) {
				calendarData[i] = {
						day: i + 1,
						weekday: weekdayCount
				}
				// 曜日のカウントが6(土曜日)まできたら0(日曜日)に戻す
				if(weekdayCount >= 6) {
						weekdayCount = 0;
				} else {
						weekdayCount++;
				}
		}
		
		return calendarData;
}

function get_kanshi(date){
		var diffTime = date - STD_DAY;
		var diffDay = Math.floor(diffTime / (1000 * 60 * 60 * 24));
		
		diffDay = diffDay + STD_KANSHI;
		var kanshi =  diffDay % 60;
		
		if(kanshi < 0){
				kanshi = 60 + kanshi;
		}
		
		return ROKUJU_KANSHI[kanshi];
}

function get_unsei(date, patern){
		var diffTime = date - STD_DAY;
		var diffDay = Math.floor(diffTime / (1000 * 60 * 60 * 24));
		
		diffDay = diffDay + STD_KANSHI + patern;
		var unsei =  diffDay % 12;
		
		if(unsei < 0){
				unsei = 12 + unsei;
		}
		
		return unsei;
}

export default {
	components:{
		CoreToolbar
	},
	mounted: function(){
		for(var i=0; i < 12; i++){
			this.topImgs.push(new Image())
			this.topImgs[i].src = `/${i+1}.png`;
		}
		this.listImg.src = "/kanshi_hyou.png";
		this.listImg.onload = function() {
			//console.log("listImgDone")
		}
		this.tentyusatsuImg.src = "/tentyu.png";
		this.tentyusatsuImg.onload = function() {
			//console.log("tentyusatsuImgDone")
		}
		this.maruImg.src = "/maru.png";
		this.maruImg.onload = function() {
			//console.log("maruImgDone")
		}
		this.batsuImg.src = "/batsu.png";
		this.batsuImg.onload = function() {
			//console.log("batsuImgDone")
		}
		this.nijuImg.src = "/niju.png"
		this.nijuImg.onload = function() {
			//console.log("nijuImgDone")
		}
		this.hanaImg.src = "/hana.png"
		this.hanaImg.onload = function() {
			//console.log("hanaImgDone")
		}
	},
	data: ()=>({
		loadCnt: 0,
		position:0,
		topImgs: [],
		listImg: new Image(),
		tentyusatsuImg: new Image(),
		maruImg: new Image(),
		batsuImg: new Image(),
		nijuImg: new Image(),
		hanaImg: new Image(),
		picker: new Date().toISOString().substr(0, 7),
		paterns: [1, 2,3,4,5,6,7,8,9,10,11,12],
		selectPatern: 1,
	}),
	methods: {
		downloadCanvas: function(){
			let canvas = document.getElementById('preview')
			let link = document.getElementById('hiddenLink')
			link.href = canvas.toDataURL()

			link.click()
		},
		showPreview: function(){
			//ここで描画の処理
			//描画コンテキストの取得
			var canvas = document.getElementById('preview');
			
			if (canvas.getContext) {
				var context = canvas.getContext('2d');
				this.DrawTemplate(context,new Date(this.picker));
			}
		},
		DrawTemplate: function(cont,current){
			
			var year = current.getFullYear();
			var month = current.getMonth() + 1;
			
			var tmp_x = (FRAME_RD.x - FRAME_LD.x)/7;
			
			cont.fillStyle = "rgb(255,255,255)";
			cont.fillRect(0,0,890,840);
			cont.lineWidth = 2;
			cont.fillStyle = "#000";
			const monthfontsLength = month.toString().length;

			cont.font = '90px "YuMincho"';
			if(monthfontsLength == 2){
				cont.fillText( month.toString(), MONTH_POS.x - 40, MONTH_POS.y);
			}else{
				cont.fillText( month.toString(), MONTH_POS.x, MONTH_POS.y);
			}
			
			cont.font = "30px 'YuMincho'";
			cont.fillText( year.toString(), YEAR_POS.x, YEAR_POS.y);
			
			cont.font = "25px 'YuMincho'";
			var monthtextfontsLength = MONTH_EN[month-1].length;
			cont.fillText( MONTH_EN[month-1], MONTH_EN_POS.x - (monthtextfontsLength * 8), MONTH_EN_POS.y);
							
			cont.drawImage(this.topImgs[month-1], PIC_POS.x, PIC_POS.y,205,154);
			cont.drawImage(this.listImg, HYOU_POS.x, HYOU_POS.y,200,100);
			
			var weekdayData = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

			//曜日の外枠を描画
			cont.fillStyle = "#000";
			cont.beginPath();
			//パスの開始座標を指定する
			cont.moveTo(FRAME_LU.x,FRAME_LU.y);
			cont.lineTo(FRAME_LU.x,FRAME_LU.y + WEEKFRAME_OFFSET.y);
			cont.lineTo(FRAME_RU.x,FRAME_LU.y + WEEKFRAME_OFFSET.y);
			cont.lineTo(FRAME_RU.x,FRAME_LU.y);
			//パスを閉じる（最後の座標から開始座標に向けてラインを引く）
			cont.closePath();
			//現在のパスを輪郭表示する
			cont.stroke();

			const colorList = ["#ea554a", "#e84994", "#ffe339", "#76be5d", "#c82875", "#407cc0", "#00b9ef"]
			for (var i = 0; i < weekdayData.length; i++) {
				//曜日の背景色を描画
				cont.fillStyle = colorList[i];
				cont.fillRect(FRAME_LU.x + i * tmp_x + 1, FRAME_LU.y + WEEKFRAME_OFFSET.y + 1, tmp_x-2, -WEEKFRAME_OFFSET.y-2)

				//曜日の外枠を描画
				cont.fillStyle = "#000";
				cont.beginPath();
				//パスの開始座標を指定する
				cont.moveTo(FRAME_LU.x + i * tmp_x, FRAME_LU.y);
				cont.lineTo(FRAME_LU.x + i * tmp_x, FRAME_LU.y + WEEKFRAME_OFFSET.y);
				//パスを閉じる（最後の座標から開始座標に向けてラインを引く）
				cont.closePath();
				//現在のパスを輪郭表示する
				cont.stroke();
				
				// if(i == 0){
				// 	cont.fillStyle = "#F00";
				// }else if(i==6){
				// 	cont.fillStyle = "#00F";
				// }else{
				// 	cont.fillStyle = "#000";
				// }
				cont.fillStyle = "#FFF";
				cont.font = "23px 'Hiragino Maru Gothic ProN'";
				cont.fillText(weekdayData[i], FRAME_LU.x + WEEK_OFFSET.x + i * tmp_x, FRAME_LU.y + WEEK_OFFSET.y);
			}
			
			var Cdata= get_month_calendar(year,month);
			
			var y_count = 1;
			for(var i = 0; i < Cdata.length; i++){
				if(Cdata[i]['weekday'] >= 6){
					y_count++;
				}
			}
			if(Cdata[Cdata.length-1]['weekday'] == 6){
				y_count--;
			}
			//console.log("y_count = ",y_count);
			
			
			//外枠を描画
			cont.beginPath();
			//パスの開始座標を指定する
			cont.moveTo(FRAME_LU.x,FRAME_LU.y);
			//座標を指定してラインを引いていく
			cont.lineTo(FRAME_LD.x,FRAME_LD.y);
			cont.lineTo(FRAME_RD.x,FRAME_RD.y);
			cont.lineTo(FRAME_RU.x,FRAME_RU.y);
			//パスを閉じる（最後の座標から開始座標に向けてラインを引く）
			cont.closePath();
			//現在のパスを輪郭表示する
			cont.stroke();
			
			//縦線を描画
			cont.beginPath();
			var tmp_vec = new Vector2(tmp_x,0);
			var line_pos = new Vector2(FRAME_LU.x,FRAME_LU.y);
			line_pos.add(tmp_vec);
			for(var i = 0; i < 6; i++){
				cont.moveTo(line_pos.x,line_pos.y);
				cont.lineTo(line_pos.x,FRAME_LD.y);
				line_pos.add(tmp_vec);
			}
			//パスを閉じる（最後の座標から開始座標に向けてラインを引く）
			cont.closePath();
			//現在のパスを輪郭表示する
			cont.stroke();
			
			
			//横線を引いていく
			cont.beginPath();
			var tmp_y = (FRAME_LD.y - FRAME_LU.y)/y_count;
			tmp_vec = new Vector2(0,tmp_y);
			line_pos = new Vector2(FRAME_LU.x,FRAME_LU.y);
			line_pos.add(tmp_vec);
			for(var i = 0; i < 6; i++){
				cont.moveTo(line_pos.x,line_pos.y);
				cont.lineTo(FRAME_RD.x,line_pos.y);
				line_pos.add(tmp_vec);
			}
			//パスを閉じる（最後の座標から開始座標に向けてラインを引く）
			cont.closePath();
			//現在のパスを輪郭表示する
			cont.stroke();
			
			//マスに書くことを描画していく
			var y_carsor = 0;
			
			for(var i = 0; i < Cdata.length; i++){
				var lu_pos = new Vector2(FRAME_LU.x + Cdata[i]['weekday'] * tmp_x, FRAME_LU.y + tmp_y * y_carsor)
				
				//日付の描画
				if(Cdata[i]['weekday'] == 0){
					cont.fillStyle = "#F00";
				}else if(Cdata[i]['weekday']==6){
					cont.fillStyle = "#00F";
				}else{
					cont.fillStyle = "#000";
				}
				cont.font = "21px 'YuMincho'";
				cont.fillText(Cdata[i]['day'], lu_pos.x + DAY_OFFSET.x, lu_pos.y + DAY_OFFSET.y);
				
				//干支の描画
				cont.fillStyle = "#000";
				cont.font = "13px 'Hiragino Maru Gothic ProN'";
				var kanshi = get_kanshi(new Date(year,month-1,Cdata[i]['day']));
				cont.fillText(kanshi, lu_pos.x + KANSHI_OFFSET.x, lu_pos.y + KANSHI_OFFSET.y);
				
				cont.fillStyle = "#000";
				cont.font = "11px 'Hiragino Maru Gothic ProN'";
				var unsei = get_unsei(new Date(year,month-1,Cdata[i]['day']), this.selectPatern);
				//console.log(UNSEI[unsei].length)
				if(UNSEI[unsei].length == 2){
					cont.fillText(UNSEI[unsei], lu_pos.x + UNSEI_OFFSET.x + 6, lu_pos.y + UNSEI_OFFSET.y);
				}else{
					cont.fillText(UNSEI[unsei], lu_pos.x + UNSEI_OFFSET.x, lu_pos.y + UNSEI_OFFSET.y);
				}
				
				if(unsei == 0 || unsei == 1 || unsei == 2){
					//ハナマル
					cont.drawImage(this.hanaImg, lu_pos.x+ICON_OFFSET.x, lu_pos.y+ICON_OFFSET.y,25,25);
				}else if(unsei == 3 || unsei == 4 || unsei == 5){
					//天中殺
					cont.drawImage(this.tentyusatsuImg, lu_pos.x+ICON_OFFSET.x-9, lu_pos.y+ICON_OFFSET.y + 3,45,22);
				}else if(unsei == 6 || unsei == 7 || unsei == 8){
					//マル
					cont.drawImage(this.maruImg, lu_pos.x+ICON_OFFSET.x, lu_pos.y+ICON_OFFSET.y,20,20);
				}else if (unsei == 9){
					//バツ
					cont.drawImage(this.batsuImg, lu_pos.x+ICON_OFFSET.x+5, lu_pos.y+ICON_OFFSET.y+7,13,13);
				}else if(unsei == 10){
					//二重丸
					cont.drawImage(this.nijuImg, lu_pos.x+ICON_OFFSET.x, lu_pos.y+ICON_OFFSET.y,20,20);
				}else if(unsei == 11){
					//バツバツ
					cont.drawImage(this.batsuImg, lu_pos.x+ICON_OFFSET.x, lu_pos.y+ICON_OFFSET.y+7,13,13);
					cont.drawImage(this.batsuImg, lu_pos.x+ICON_OFFSET.x+13, lu_pos.y+ICON_OFFSET.y+7,13,13);
				}
				
				if(Cdata[i]['weekday'] >= 6){
					y_carsor++;
				}
			}
		}
	}
}
</script>

<style>
#preview{
	background-color: white;
}

</style>