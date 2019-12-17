<template>
<v-container fill-height fill-width fluid grid-list-xl>
	<v-layout justify-center row wrap>
		<v-dialog v-model="isLoading" fullscreen full-width>
            <v-container fluid fill-height style="background-color: rgba(255, 255, 255, 0.5);">
                <v-layout justify-center align-center>
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </v-layout>
            </v-container>
        </v-dialog>
		<v-flex xs12 md12>
			<v-card>
				<v-card-text>
					<v-select v-model="selectPatern" :items="paterns" label="パターンを選択">
					</v-select>
				</v-card-text>
				<v-date-picker v-model="picker" type="month" color="cyan lighten-1" locale="jp-ja" :day-format="date => new Date(date).getDate()"></v-date-picker>
				<v-card-actions>
					<v-btn v-on:click="downloadYearCanvas(0)">一年分ダウンロード(手帳型)</v-btn>
					<v-btn v-on:click="downloadYearCanvas(1)">一年分ダウンロード(卓上型)</v-btn>
				</v-card-actions>
			</v-card>
			<v-card dark>
				<v-layout class="justify-center my-5">
					<canvas id="preview" class="my-5" width="1748" height="2480"></canvas>
					<canvas id="desk" class="my-5" width="2125" height="1523"></canvas>
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

const canvasWidth = [1748,2125]
const canvasHeight = [2480,1523]
const scale = 3;
const YEAR_POS = [new Vector2(254 * scale,120 * scale), new Vector2(318 * scale,120 * scale)];
const MONTH_EN_POS = [new Vector2(280 * scale,147 * scale), new Vector2(338 * scale,147 * scale)];
const MONTH_POS = [new Vector2(265 * scale,90 * scale), new Vector2(325 * scale,90 * scale)];
const MONTH_EN_OFFSET = [5, 4]
const MONTH_OFFSET = [30, 20]

const PIC_POS = [new Vector2(10 * scale,10 * scale),new Vector2(10 * scale,10 * scale)];
const HYOU_POS = [new Vector2(360 * scale,35 * scale),new Vector2(470 * scale,35 * scale)];

const WEEKFRAME_OFFSET = [new Vector2(0,-30 * scale),new Vector2(0,-30 * scale)]

const FRAME_LU = [new Vector2(30 * scale,200 * scale), new Vector2(30 * scale,200 * scale)];
const FRAME_LD = [new Vector2(30 * scale,800 * scale), new Vector2(30 * scale,500 * scale)];
const FRAME_RD = [new Vector2(550 * scale,800 * scale),new Vector2(678 * scale,500 * scale)];
const FRAME_RU = [new Vector2(550 * scale,200 * scale), new Vector2(678 * scale,200 * scale)];

const WEEK_OFFSET = [new Vector2(12 * scale,-7 * scale),new Vector2(12 * scale,-7 * scale)];
const DAY_OFFSET = [new Vector2(5 * scale,25 * scale),new Vector2(5 * scale,25 * scale)];
const KANSHI_OFFSET = [new Vector2(5 * scale,55 * scale),new Vector2(5 * scale,45 * scale)];
const UNSEI_OFFSET = [new Vector2(33 * scale,20 * scale),new Vector2(33 * scale,20 * scale)];
const ICON_OFFSET = [new Vector2(40 * scale,35 * scale),new Vector2(40 * scale,22 * scale)];

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
			var tmpImg = new Image()
			tmpImg.src = `/${i+1}.png`;
			this.loadCnt++
			tmpImg.onload = function(){
				console.log("test")
				this.loadCnt--
			}.bind(this)
			this.topImgs.push(tmpImg)
		}

		this.displayImg.src = "/display.png";
		this.loadCnt++
		this.displayImg.onload = function() {
			console.log("displayImgDone")
			this.loadCnt--
		}.bind(this)

		this.noteImg.src = "/memo.png";
		this.loadCnt++
		this.noteImg.onload = function() {
			console.log("noteImgDone")
			this.loadCnt--
		}.bind(this)
		
		this.listImg.src = "/kanshi_hyou.png";
		this.loadCnt++
		this.listImg.onload = function() {
			console.log("listImgDone")
			this.loadCnt--
		}.bind(this)
		
		this.tentyusatsuImg.src = "/tentyu.png";
		this.loadCnt++
		this.tentyusatsuImg.onload = function() {
			console.log("tentyusatsuImgDone")
			this.loadCnt--
		}.bind(this)
		this.maruImg.src = "/maru.png";
		this.loadCnt++
		this.maruImg.onload = function() {
			console.log("maruImgDone")
			this.loadCnt--
		}.bind(this)
		this.batsuImg.src = "/batsu.png";
		this.loadCnt++
		this.batsuImg.onload = function() {
			console.log("batsuImgDone")
			this.loadCnt--
		}.bind(this)
		this.nijuImg.src = "/niju.png"
		this.loadCnt++
		this.nijuImg.onload = function() {
			console.log("nijuImgDone")
			this.loadCnt--
		}.bind(this)
		this.hanaImg.src = "/hana.png"
		this.loadCnt++
		this.hanaImg.onload = function() {
			console.log("hanaImgDone")
			this.loadCnt--
		}.bind(this)
	},
	data: ()=>({
		loadCnt: 0,
		position:0,
		topImgs: [],
		displayImg: new Image(),
		noteImg: new Image(),
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
	computed:{
		isLoading: function(){
			if(this.loadCnt <= 0) return false
			return true
		}
	},
	methods: {
		downloadYearCanvas: function(idx){
			let canvasid;
			let option;
			if(idx == 0){
				canvasid = "preview";
				option = {}
			}else{
				canvasid = "desk";
				option = {
					orientation: "landscape",
					format:[129,180]
				}
			}

			let canvas = document.getElementById(canvasid)

			var pdf = new jsPDF(option);
			var width = pdf.internal.pageSize.width;
			console.log(width)

			var date = new Date(this.picker)
			if (canvas.getContext) {
				var context = canvas.getContext('2d');
			}

			//表紙を入れる

			
			//ノートのページを追加
			if(idx == 0){
				context.fillStyle = "rgb(255,255,255)";
				context.fillRect(0,0,canvasWidth[idx],canvasHeight[idx]);
				context.drawImage(this.noteImg, 0, 0, canvasWidth[idx], canvasHeight[idx]);
				var imgData = canvas.toDataURL("image/jpeg");
				pdf.addImage(imgData, 'JPEG', 0, 0,width,0);
			}	

			for(var i = 0; i < 12; i++){
				pdf.addPage();
				var tmpDate = new Date(date.getFullYear()+"-"+ String(i+1))
				this.DrawTemplate(context,tmpDate,idx);

				var imgData = canvas.toDataURL("image/jpeg");
				pdf.addImage(imgData, 'JPEG', 0, 0,width,0);
			}
			pdf.save(date.getFullYear() + "_"+ String(this.selectPatern) + ".pdf");			
		},
		downloadCanvas: function(){
			let canvas = document.getElementById('preview')
			//let link = document.getElementById('hiddenLink')
			//link.href = canvas.toDataURL()
			var imgData = canvas.toDataURL("image/jpeg");
			var pdf = new jsPDF();
			var width = pdf.internal.pageSize.width;
			pdf.addImage(imgData, 'JPEG', 0, 0,width,0);
			
			//var download = document.getElementById('download');
			pdf.save("download.pdf");
			//link.click()
		},
		showPreview: function(){
			//ここで描画の処理
			//描画コンテキストの取得
			var canvas = document.getElementById('preview');
			
			if (canvas.getContext) {
				var context = canvas.getContext('2d');
				this.DrawTemplate(context,new Date(this.picker),0);
			}
		},
		DrawTemplate: function(cont,current,idx){
			
			var year = current.getFullYear();
			var month = current.getMonth() + 1;
			
			var tmp_x = (FRAME_RD[idx].x - FRAME_LD[idx].x)/7;
			
			cont.fillStyle = "rgb(255,255,255)";
			cont.fillRect(0,0,890 * scale,840 * scale);
			cont.lineWidth = 2 * scale;
			cont.fillStyle = "#000";
			const monthfontsLength = month.toString().length;

			var fontsize = 90  * scale;
			cont.font = `${fontsize}px "YuMincho"`;
			if(monthfontsLength == 2){
				cont.fillText( month.toString(), MONTH_POS[idx].x - MONTH_OFFSET[idx] * scale, MONTH_POS[idx].y);
			}else{
				cont.fillText( month.toString(), MONTH_POS[idx].x, MONTH_POS[idx].y);
			}
			
			fontsize = 30 * scale;
			cont.font = `${fontsize}px 'YuMincho'`;
			cont.fillText( year.toString(), YEAR_POS[idx].x, YEAR_POS[idx].y);
			
			fontsize = 25 * scale;
			cont.font = `${fontsize}px 'YuMincho'`;
			var monthtextfontsLength = MONTH_EN[month-1].length;
			cont.fillText( MONTH_EN[month-1], MONTH_EN_POS[idx].x - (monthtextfontsLength * MONTH_EN_OFFSET[idx] * scale), MONTH_EN_POS[idx].y);
							
			cont.drawImage(this.topImgs[month-1], PIC_POS[idx].x, PIC_POS[idx].y,205 * scale,154 * scale);
			cont.drawImage(this.listImg, HYOU_POS[idx].x, HYOU_POS[idx].y,200 * scale,100 * scale);
			
			var weekdayData = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

			//曜日の外枠を描画
			cont.fillStyle = "#000";
			cont.beginPath();
			//パスの開始座標を指定する
			cont.moveTo(FRAME_LU[idx].x,FRAME_LU[idx].y);
			cont.lineTo(FRAME_LU[idx].x,FRAME_LU[idx].y + WEEKFRAME_OFFSET[idx].y);
			cont.lineTo(FRAME_RU[idx].x,FRAME_LU[idx].y + WEEKFRAME_OFFSET[idx].y);
			cont.lineTo(FRAME_RU[idx].x,FRAME_LU[idx].y);
			//パスを閉じる（最後の座標から開始座標に向けてラインを引く）
			cont.closePath();
			//現在のパスを輪郭表示する
			cont.stroke();

			const colorList = ["#ea554a", "#e84994", "#ffe339", "#76be5d", "#c82875", "#407cc0", "#00b9ef"]
			for (var i = 0; i < weekdayData.length; i++) {
				//曜日の背景色を描画
				cont.fillStyle = colorList[i];
				cont.fillRect(FRAME_LU[idx].x + i * tmp_x + 1, FRAME_LU[idx].y + WEEKFRAME_OFFSET[idx].y + 1, tmp_x-2, -WEEKFRAME_OFFSET[idx].y-2)

				//曜日の外枠を描画
				cont.fillStyle = "#000";
				cont.beginPath();
				//パスの開始座標を指定する
				cont.moveTo(FRAME_LU[idx].x + i * tmp_x, FRAME_LU[idx].y);
				cont.lineTo(FRAME_LU[idx].x + i * tmp_x, FRAME_LU[idx].y + WEEKFRAME_OFFSET[idx].y);
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
				fontsize = 23 * scale;
				cont.font = `${fontsize}px 'Hiragino Maru Gothic ProN'`;
				cont.fillText(weekdayData[i], FRAME_LU[idx].x + WEEK_OFFSET[idx].x + i * tmp_x, FRAME_LU[idx].y + WEEK_OFFSET[idx].y);
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
			cont.moveTo(FRAME_LU[idx].x,FRAME_LU[idx].y);
			//座標を指定してラインを引いていく
			cont.lineTo(FRAME_LD[idx].x,FRAME_LD[idx].y);
			cont.lineTo(FRAME_RD[idx].x,FRAME_RD[idx].y);
			cont.lineTo(FRAME_RU[idx].x,FRAME_RU[idx].y);
			//パスを閉じる（最後の座標から開始座標に向けてラインを引く）
			cont.closePath();
			//現在のパスを輪郭表示する
			cont.stroke();
			
			//縦線を描画
			cont.beginPath();
			var tmp_vec = new Vector2(tmp_x,0);
			var line_pos = new Vector2(FRAME_LU[idx].x,FRAME_LU[idx].y);
			line_pos.add(tmp_vec);
			for(var i = 0; i < 6; i++){
				cont.moveTo(line_pos.x,line_pos.y);
				cont.lineTo(line_pos.x,FRAME_LD[idx].y);
				line_pos.add(tmp_vec);
			}
			//パスを閉じる（最後の座標から開始座標に向けてラインを引く）
			cont.closePath();
			//現在のパスを輪郭表示する
			cont.stroke();
			
			
			//横線を引いていく
			cont.beginPath();
			var tmp_y = (FRAME_LD[idx].y - FRAME_LU[idx].y)/y_count;
			tmp_vec = new Vector2(0,tmp_y);
			line_pos = new Vector2(FRAME_LU[idx].x,FRAME_LU[idx].y);
			line_pos.add(tmp_vec);
			for(var i = 0; i < 6; i++){
				cont.moveTo(line_pos.x,line_pos.y);
				cont.lineTo(FRAME_RD[idx].x,line_pos.y);
				line_pos.add(tmp_vec);
			}
			//パスを閉じる（最後の座標から開始座標に向けてラインを引く）
			cont.closePath();
			//現在のパスを輪郭表示する
			cont.stroke();
			
			//マスに書くことを描画していく
			var y_carsor = 0;
			
			for(var i = 0; i < Cdata.length; i++){
				var lu_pos = new Vector2(FRAME_LU[idx].x + Cdata[i]['weekday'] * tmp_x, FRAME_LU[idx].y + tmp_y * y_carsor)
				
				//日付の描画
				if(Cdata[i]['weekday'] == 0){
					cont.fillStyle = "#F00";
				}else if(Cdata[i]['weekday']==6){
					cont.fillStyle = "#00F";
				}else{
					cont.fillStyle = "#000";
				}
				fontsize = 21 * scale
				cont.font = `${fontsize}px 'YuMincho'`;
				cont.fillText(Cdata[i]['day'], lu_pos.x + DAY_OFFSET[idx].x, lu_pos.y + DAY_OFFSET[idx].y);
				
				//干支の描画
				cont.fillStyle = "#000";
				fontsize = 13 * scale
				cont.font = `${fontsize}px 'Hiragino Maru Gothic ProN'`;
				var kanshi = get_kanshi(new Date(year,month-1,Cdata[i]['day']));
				cont.fillText(kanshi, lu_pos.x + KANSHI_OFFSET[idx].x, lu_pos.y + KANSHI_OFFSET[idx].y);
				
				cont.fillStyle = "#000";
				fontsize = 11 * scale
				cont.font = `${fontsize}px 'Hiragino Maru Gothic ProN'`;
				var unsei = get_unsei(new Date(year,month-1,Cdata[i]['day']), this.selectPatern);
				//console.log(UNSEI[unsei].length)
				if(UNSEI[unsei].length == 2){
					cont.fillText(UNSEI[unsei], lu_pos.x + UNSEI_OFFSET[idx].x + 6 * scale, lu_pos.y + UNSEI_OFFSET[idx].y);
				}else{
					cont.fillText(UNSEI[unsei], lu_pos.x + UNSEI_OFFSET[idx].x, lu_pos.y + UNSEI_OFFSET[idx].y);
				}
				
				if(unsei == 0 || unsei == 1 || unsei == 2){
					//ハナマル
					cont.drawImage(this.hanaImg, lu_pos.x+ICON_OFFSET[idx].x, lu_pos.y+ICON_OFFSET[idx].y,25 * scale,25 * scale);
				}else if(unsei == 3 || unsei == 4 || unsei == 5){
					//天中殺
					cont.drawImage(this.tentyusatsuImg, lu_pos.x+ICON_OFFSET[idx].x-9 * scale, lu_pos.y+ICON_OFFSET[idx].y + 3,45 * scale,22 * scale);
				}else if(unsei == 6 || unsei == 7 || unsei == 8){
					//マル
					cont.drawImage(this.maruImg, lu_pos.x+ICON_OFFSET[idx].x, lu_pos.y+ICON_OFFSET[idx].y,20 * scale,20 * scale);
				}else if (unsei == 9){
					//バツ
					cont.drawImage(this.batsuImg, lu_pos.x+ICON_OFFSET[idx].x+5 * scale, lu_pos.y+ICON_OFFSET[idx].y+7 * scale,13 * scale,13 * scale);
				}else if(unsei == 10){
					//二重丸
					cont.drawImage(this.nijuImg, lu_pos.x+ICON_OFFSET[idx].x, lu_pos.y+ICON_OFFSET[idx].y,20 * scale,20 * scale);
				}else if(unsei == 11){
					//バツバツ
					cont.drawImage(this.batsuImg, lu_pos.x+ICON_OFFSET[idx].x, lu_pos.y+ICON_OFFSET[idx].y+7 * scale,13 * scale,13 * scale);
					cont.drawImage(this.batsuImg, lu_pos.x+ICON_OFFSET[idx].x+13 * scale, lu_pos.y+ICON_OFFSET[idx].y+7 * scale,13 * scale,13 * scale);
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