/*
Mfstaj'daki şirketleri hem şehre hem de bölüme göre aramaya elveren program.
3 aşamalıdır:
	1- contentgetter.js node kullanarak mfstaj'dan raw html çeker
	2- company_gatherer.pl raw html'i parse edip "tr" elementleri (innerHTML) oluşturur
	3- main.js datatables api'ı kullanarak pagination ve filtreleme sağlar.
Haziran 2019.
*/
let currentPage = 1;
const compPerPage = 48; // number of companies to show within a page
const pagerWidth = 509; // prev-..-next's width

// The Table from 2 point of views
let table_p5;
let table_dt;

// for filtering
let deptSelector;
let citySelector;

// for searching
let finder;
let radio;

// randomcolorgenerator
const rcolor = () => color(random(256), random(256), random(256));
let rc; // a random color

function setup() {
	noCanvas();
	document.body.style.background = color(151); // color(random(256));

	const header = select("#header");
	header.style("color", rcolor());

	const filterBar = select("#filterBar"); // for y position of pager below
	const filterTab = select("#filtreleme"); // for width of 		 "     "
	filterTab.position(5, filterBar.position.y); // paddingLeft of filter mekan

	const filterButton = select("#filterButton");
	filterButton.mousePressed(filterCompanies);
	filterButton.style("color", rcolor());
	filterButton.style("background-color", rcolor());
	filterButton.style("border", "none");

	deptSelector = select("#filterByDept");
	citySelector = select("#filterByCity");
	deptSelector.style("color", rcolor());
	deptSelector.style("background-color", rcolor());
	citySelector.style("color", rcolor());
	citySelector.style("background-color", rcolor());

	// searching
	finder = createElement("input", "ups");
	finder.position(600, 54);
	finder.size(220, 20);
	finder.style("color", rcolor());
	finder.style("background-color", rcolor());
	finder.style("border", "none");
	//finder.changed(performSearch); // yazıp enter'a basanlara gelsin

	const findButton = createElement("button", "Search");
	findButton.mousePressed(performSearch);
	findButton.position(830, 51);
	findButton.size(70, 27);
	findButton.style("color", rcolor());
	findButton.style("background-color", rcolor());
	findButton.style("border", "none");

	// radio buttons for by name or sector searching
	radio = createRadio();
	radio.option("by name");
	radio.option("by sector");
	radio.position(finder.position().x + 35, finder.position().y + 25);
	selectAll("label")[2].style("color", rcolor()); // 0 ve 1 halen aranıyor!
	selectAll("label")[3].style("color", rcolor());
	radio.value("by name"); // default

	// Company Name   City   Dept   Sector	// veryfirst row (header) of the table
	const sections = select("#sections");
	for(const th of sections.elt.children) {
		th.style.color = rcolor();
	}

	// datatables paginator/wrapper positioning & width,height
	select("#companies_paginate").position(950, -30);
	select("#companies_paginate").size(pagerWidth, 41);
	select("#companies_wrapper").position(0, 75);

	// The table from 2 perspectives :b
	table_dt = $("#companies").DataTable();
	table_p5 = select("#companies");

	// for draw's use
	rc = rcolor();
}


function draw() {
	// Styling of odd/even
	let i = 0;
	while(t_row = table_p5.elt.children[1].children[i++]) {
		t_row.style.color = (i & 1) ? "darkblue" : "blue";
		t_row.style["background-color"] = (i & 1) ? "lightgreen" : color(106, 208, 112, 255);
	}
	if(table_dt.page.info().pages <= 1) {
		select("#companies_paginate").style("display", "none");
	}
	else {
		select("#companies_paginate").style("display", "block");
		const next = select("#companies_next");
		const prev = select("#companies_previous");

		const nextClass = next.class();
		const prevClass = prev.class();
		const reg = /disabled/;
		if(reg.exec(nextClass) === null) {
			next.elt.setAttribute("style", "color: darkblue !important")
			next.style("background-color", "#AEE25B");
		}
		if(reg.exec(prevClass) === null) {
			prev.elt.setAttribute("style", "color: darkblue !important")
			prev.style("background-color", "#AEE25B");
		}
	}
}

function filterCompanies() {
	/* filterButton's onClick function */
	const dept = deptSelector.value();
	const city = citySelector.value();

	// restore any filtering first (1: city-based, 2: dept-based)
	modifyTable(1, "");
	modifyTable(2, "");

	if(dept == "any" && city == "any")
		return;

	if(city !== "any")
		modifyTable(1, city);

	if(dept !== "any")
		modifyTable(2, dept);
}

function modifyTable(colNo, value) {
	if(table_dt.column(colNo).search() !== value) {
		table_dt
			.column(colNo)
			.search(value)
			.draw();
	}
}

function performSearch() {
	/* finder's callback: based on company name or sector */
	const value = finder.value();

	// To compensate for Bilişim and Bilisim
	const replacer = /[\u0300-\u036F]/g;
	const otherVal = value
		.normalize('NFKD')
		.replace(replacer, '')
		.replace(/ı/g, "i"); // for some reason ı is not in above Unicode range.
	const reg = value + "|" + otherVal;

	if(radio.value() === "by name") {
		modifyTable(3, ""); // clear the sector cache
		if(table_dt.column(0).search() !== value) {
			table_dt
				.column(0)
				.search(reg, true, false) // enable regex match, disable smart
				.draw();
		}
	}
	else {
		// "by sector"
		modifyTable(0, ""); // clear the name cache
		if(table_dt.column(3).search() !== value) {
			table_dt
				.column(3)
				.search(reg, true, false)
				.draw();
		}
	}
}