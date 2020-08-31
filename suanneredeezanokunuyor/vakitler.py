# -*- coding: utf-8 -*-
"""
<<Türkiye'deki illerin 1 aylık namaz vakitlerini elde etmeye çalışıyoruz>>
Started on Sat Jul 13 20:45:59 2019
@Author: Mayd_51
"""
from bs4 import BeautifulSoup
from collections import namedtuple
from datetime import datetime as dt
from urllib.request import urlopen
import calendar
import json
import re
import itertools as it

sehirler = ("adana", "adiyaman", "afyonkarahisar", "agri", "amasya", "ankara",
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
            "osmaniye", "duzce")

bes_vakit = ("sab", "ogl", "iki", "aks", "yat")

Saat = namedtuple("Saat", ["hour", "minute"], defaults=["00", "00"])

#number of days in the current month
num_days = calendar.monthrange(dt.now().year, dt.now().month)[1]

#bugün ayın kaçı?
today = dt.now().day

vakit_dict = dict.fromkeys(bes_vakit, None)
days_dict = dict.fromkeys(range(1, num_days + 1), vakit_dict)
cities_dict = dict.fromkeys(sehirler, days_dict)

# WARNING: sehirler slice-by-slice process edilebilir hata verirse (e.g. 25 vilayet at a time)
for sehir in sehirler:
    site = f"https://www.haberturk.com/namaz-vakitleri/{sehir}"
    html_source = urlopen(site)

    soup = BeautifulSoup(html_source, 'html.parser')

    imsakiye_table = soup.find(id="imsakiye-table")
    imsakiye_body = imsakiye_table.contents[3]  # skipping \n, thead and \n
    imsakiye_contents = ("".join(str(ibc).split("\n")) for ibc in imsakiye_body.children if ibc != "\n")
    vakitler = [ (Saat(*vakit) for vakit in re.findall(r">\s*(\d{2}):(\d{2})\s*</", content)[1:]) for content in imsakiye_contents]

    sehir_aylik = cities_dict[sehir]
    starting_day = 0 # if wanted from today, make it <today-1>
    for day in it.islice(sehir_aylik, starting_day, num_days):
        sehir_aylik[day] = dict(zip(bes_vakit, vakitler[day-1]))

    with open(f"sehirler/{sehir}.txt", mode="w") as f:
        f.write(json.dumps(sehir_aylik, indent=4))

    print(f"{sehir} processed.")

# Modifying this script a little so that the last modified date is changed to its last run date
with open("vakitler.py", "a") as fh:
    fh.write("\n# the end?")
