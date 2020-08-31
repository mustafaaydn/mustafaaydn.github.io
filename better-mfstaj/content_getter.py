# Retrieves mfstaj companies pages' html documents and writes them into files.
# July-20, @mayd
import re
import requests
import warnings

# The mfstaj's company listing url
root_url = "http://mfstaj.bilkent.edu.tr/visitor"

# First get the total number of pages
r = requests.get(root_url)
mo = re.search(r"<span.+?>1 / (\d+)</span>", r.text)
if mo:
	TOTAL_PAGES = int(mo.group(1))
else:
	warnings.warn("Couldn't infer the total number of pages, defaulting to 95..")
	TOTAL_PAGES = 95

for page_no in range(TOTAL_PAGES):
	# Request a page
	resp = requests.get(root_url, params={"start": page_no})
	resp.encoding = "utf-8"
	# If successful, write the contents into a file, else warn
	if resp.ok:
		with open(f"page_contents/page_{page_no}.txt", "w", encoding="utf-8") as fh:
			fh.write(resp.text)
		print(f"Page {page_no} / {TOTAL_PAGES-1} written.")
	else:
		warnings.warn(f"Couldn't fetch {page_no}'th page data, continuing with next one")

print("Done.")