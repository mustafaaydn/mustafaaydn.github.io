/*
 * Şu An Nerede Ezan Okunuyor Türkiye!
 * 14.07.2019
 */
let header;		  	 	//şehirlerin alt alta yazılmak için tutulduğu DOM elemanı
let sehirIdx = 0; 		//arkaplan resminde gösterilesi şehri söyler
let defaultImag; 		//arkaplanın gösterilecek şehir yokkenki hali
let gosterilenSehir; 	//"şu an" resmi gösterilen şehir, isminin rengini farklı kılmak için needed

const buttons = []; //sab, ogl, iki, aks, yat
const resultantSehirler = new Set(); //"'şu an' ezan okunan" şehirler
const dataSehirler = []; //namaz vakitleri
const imagSehirler = {}; //arkaplan resimleri
const sehirler = ["adana", "adiyaman", "afyonkarahisar", "agri", "amasya", "ankara",
	"antalya", "artvin", "aydin", "balikesir", "bilecik", "bingol",
	"bitlis", "bolu", "burdur", "bursa", "canakkale", "cankiri",
	"corum", "denizli", "diyarbakir", "edirne", "elazig", "erzincan",
	"erzurum", "eskisehir", "gaziantep", "giresun", "gumushane",
	"hakkari", "hatay", "isparta", "mersin", "istanbul", "izmir",
	"kars", "kastamonu", "kayseri", "kirklareli", "kirsehir", "kocaeli",
	"konya", "kutahya", "malatya", "manisa", "kahramanmaras", "mardin",
	"mugla", "mus", "nevsehir", "nigde", "ordu", "rize", "sakarya",
	"samsun", "siirt", "sinop", "sivas", "tekirdag", "tokat", "trabzon",
	"tunceli", "sanliurfa", "usak", "van", "yozgat", "zonguldak",
	"aksaray", "bayburt", "karaman", "kirikkale", "batman", "sirnak",
	"bartin", "ardahan", "igdir", "yalova", "karabuk", "kilis",
	"osmaniye", "duzce"
];
const besVakit = ["Sabah", "Öğle", "İkindi", "Akşam", "Yatsı"];
const vakitMap = {
	Sabah: "sab",
	Öğle: "ogl",
	İkindi: "iki",
	Akşam: "aks",
	Yatsı: "yat"
};
const ilkHarfMap = {
	S: "sab",
	"¿": "ogl",
	O: "ogl",
	"Þ": "iki",
	I: "iki",
	A: "aks",
	Y: "yat"
};
// Her bir ezanın kaç dakika sürdüğünün öngörüldüğü obje
const durations = {
	sab: 5,
	ogl: 4,
	iki: 5,
	aks: 3,
	yat: 5
};
const months = {
	"Mar": "Mart",
	"Jun": "Haziran",
	"Nov": "Kasim",
	"Oct": "Ekim",
	"Apr": "Nisan",
	"Feb": "Subat",
	"Jul": "Temmuz",
	"May": "Mayis",
	"Aug": "Agustos",
	"Dec": "Aralik",
	"Sep": "Eylul",
	"Jan": "Ocak"
};

const rcolor = () => color(random(256), random(256), random(256));

function preload() {
	for(const sehir of sehirler) {
		const jsonData = loadJSON(`sehirler/${sehir}.txt`);
		jsonData["sehir"] = sehir; //adding an attribute
		dataSehirler.push(jsonData);

		const imagData = loadImage(`fotograflar/${sehir}.jpeg`);
		imagSehirler[sehir] = imagData;
	}
	defaultImag = loadImage("defaultimg.jpg");
}

function setup() {
	createCanvas(1535, 718);
	document.body.style["background-color"] = "gray"
	header = createElement("h2", "");
	header.position(900, 200);
	header.style("color", "darkblue");

	for(let i = 0; i < besVakit.length; ++i) {
		const buttonName = besVakit[i]; //Sabah
		const shortName = vakitMap[buttonName]; //sab
		buttons.push(createButton(buttonName));
		buttons[i].position(i * 200 + 300, 175);
		buttons[i].class(shortName);

		buttons[i].size(80, 27);
		buttons[i].style("background-color", rcolor());
		buttons[i].style("color", rcolor());
		buttons[i].style("border", "inherit");
		buttons[i]["vak"] = shortName;
		buttons[i].mousePressed(control);
	}
	const lastTime = getLastModifed("vakitler.py");
	const reg = /\d+\s+(\w+)\s(\d+)/;
	const monthYear = lastTime.match(reg);
	const month = months[monthYear[1]];
	const year = monthYear[2];
	console.log("Vakitler", year, "yılı", month, "ayı verilerine göre sunuluyor.")
}

//Hangi yılın hangi ayının vakitleri ile işlem yapıldığını anlamaya yarar
//Buna "vakitler.py"'nin son değiştirme tarihinden yola çıkarak karar veriyoruz.
function getLastModifed(fileName) {
    try {
        let req = new XMLHttpRequest();
        req.open("HEAD", fileName, false);
        req.send(null);
        return req.status == 200 ? req.getResponseHeader("Last-Modified") : false;
    }
	catch(err) {
        return "Dırı dı dın..:" + err.message;
    }
}

//Key/Mouse pressed'de çağrılabilen isminin hakkını veren fonksiyon
function updateCityList() {
	//CityList dediğimiz header elemanının html'idir
	let sehirler_html = "";
	for(const sehir of resultantSehirler) {
		//An itibariyle gösterilen şehri belli ederiz
		if(sehir === gosterilenSehir) {
			sehirler_html += "<span style = \"background-color:lightblue;\">" + sehir + "</span> <br>";
		}
		//Sıra'dan şehirler
		else {
			sehirler_html += sehir + "<br>";
		}
	}
	header.html(sehirler_html);
}
//Verilen vakit ismine göre şehirleri kontrol eder ve ezan okunan
//şehirleri "resultantSehirler"e ekler, ve de ilk sıradaki (en önce ezan başlamış olan)
//şehrin resmini arkaya yanstır. Key/Mouse-pressed'den çağrılabilir.
function checkCities(vakitName) {
	const today = new Date().getDate();
	for(const dataSehir of dataSehirler) {
		const vakit = dataSehir[today][vakitName].map(Number); //string array'inden number array'ine
		const sehir = dataSehir.sehir;
		//Bu "sehir"de ezan okunuyor heralde galiba sanırsam!
		if(suits(vakit, vakitName)) {
			resultantSehirler.add(sehir);
		}
		//Bu "sehir"de is ezan okunmuş, bitmiş
		else if(resultantSehirler.has(sehir)) {
			resultantSehirler.delete(sehir);
		}
	}
	//Herhangi bir vakte "yeni" basıldığında gösterilecek şehir varsa, ilkini gösterir
	if(resultantSehirler.size > 0) {
		gosterilenSehir = Array.from(resultantSehirler)[0];
		background(imagSehirler[gosterilenSehir]);
	}
}

//The Loop (?=Antenna :p)
function draw() {
	if(resultantSehirler.size == 0) {
		background(defaultImag);
	}
}

//2 şey gerçekleşebilir:
//1-Vaktin ilk harfi basıldığında o vakti kontrol eder
//2-Arkaplan resmi değiştirilebilir "alt" ve "üst" yön tuşlarıyla
function keyPressed() {
	//1- vakitlerin ilk harflerinden biri midir
	const vakitName = ilkHarfMap[key];
	if(vakitName) {
		checkCities(vakitName);
		updateCityList();
		//
		sehirIdx = 0;
		const btnAsIfPressed = select("." + vakitName);
		const x = btnAsIfPressed.elt.offsetLeft;
		const y = btnAsIfPressed.elt.offsetTop;
		header.position(x, y + 50);
	}
	//2-alt-üst tuşlarıyla şehir gezilebilir
	else {
		const sehirSayisi = resultantSehirler.size;
		if(sehirSayisi > 0) {
			const sehirler = Array.from(resultantSehirler);
			if(keyCode == DOWN_ARROW) {
				//Alttaki şehre geçiniz, eğer sondaysa başa sarınız
				sehirIdx = (++sehirIdx) % sehirSayisi;
			}
			else if(keyCode == UP_ARROW) {
				//Üstteki şehre geçiniz, eğer baştaysa sona sarınız
				sehirIdx = --sehirIdx < 0 ? sehirSayisi - 1 : sehirIdx;
			}
			//Gösterilesi şehir tespit edildi, kaydedilir, gösterilir
			gosterilenSehir = Array.from(resultantSehirler)[sehirIdx];
			background(imagSehirler[gosterilenSehir]);
			updateCityList();
		}
	}
}
//MousePressed event of buttons
function control(e) {
	//Hangi butona basılmış'ın x-y'si
	const x = e.path[0].offsetLeft;
	const y = e.path[0].offsetTop;

	//İller listesinin gösterileceği elemanın yerleştirilmesi
	header.position(x, y + 50);

	const vakitName = this.vak;
	checkCities(vakitName);
	updateCityList();
}
//"Ezan okunuyor mu"nun tespiti
function suits(vakit, vakitName) {
	// e.g. vakit = [16, 43]
	// 	  vakitName = "iki"
	const now = new Date();
	const saat = [now.getHours(), now.getMinutes()]; //change if debug
	const duration = durations[vakitName];
	return compare(saat, vakit) >= 0 && compare(saat, topla(vakit, duration)) <= 0;
}
//helper 1
function topla(vakit, duration) {
	let hr = vakit[0];
	let mn = vakit[1] + duration - 1; //-1 it is, 64:23 maçın 65.dakikasındadır
	if(mn >= 60) {
		mn -= 60;
		hr += 1;
	}
	return [hr, mn];
}
//helper 2
function compare(a, b) {
	return a[0] != b[0] ? a[0] - b[0] : a[1] - b[1];
}