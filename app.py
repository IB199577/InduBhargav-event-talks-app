import os
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from datetime import datetime
from flask import Flask, jsonify, render_template

app = Flask(__name__)

# Simple in-memory cache to avoid redundant network requests
CACHE = {
    "data": None,
    "last_fetched": None
}

class ReleaseNotesHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.updates = []
        self.current_type = None
        self.current_html = []
        self.current_text = []
        self.in_h3 = False
        self.started = False

    def handle_starttag(self, tag, attrs):
        if tag == 'h3':
            self.save_current_update()
            self.in_h3 = True
            self.current_html = []
            self.current_text = []
            self.started = True
        else:
            if not self.started:
                self.started = True
                self.current_type = "Update"
            attrs_str = "".join(f' {k}="{v}"' for k, v in attrs)
            self.current_html.append(f"<{tag}{attrs_str}>")

    def handle_endtag(self, tag):
        if tag == 'h3':
            self.in_h3 = False
        else:
            if self.started:
                self.current_html.append(f"</{tag}>")

    def handle_data(self, data):
        if self.in_h3:
            self.current_type = data.strip()
        else:
            if not self.started:
                self.started = True
                self.current_type = "Update"
            self.current_html.append(data)
            self.current_text.append(data)

    def save_current_update(self):
        if self.current_type and (self.current_html or self.current_text):
            html_content = "".join(self.current_html).strip()
            text_content = "".join(self.current_text).strip()
            # Clean up whitespace
            text_content = " ".join(text_content.split())
            self.updates.append({
                "type": self.current_type,
                "content": html_content,
                "text": text_content
            })
            self.current_type = None
            self.current_html = []
            self.current_text = []

    def close(self):
        super().close()
        self.save_current_update()

def fetch_and_parse_feed():
    url = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    req = urllib.request.Request(url, headers=headers)
    
    with urllib.request.urlopen(req) as response:
        xml_data = response.read()

    root = ET.fromstring(xml_data)
    ns = {'atom': 'http://www.w3.org/2005/Atom'}

    entries = []
    for entry in root.findall('atom:entry', ns):
        title = entry.find('atom:title', ns)
        title_text = title.text if title is not None else ""

        updated = entry.find('atom:updated', ns)
        updated_text = updated.text if updated is not None else ""

        link = entry.find("atom:link[@rel='alternate']", ns)
        if link is None:
            link = entry.find("atom:link", ns)
        link_href = link.attrib.get('href', '') if link is not None else ""

        content = entry.find('atom:content', ns)
        content_html = content.text if content is not None else ""

        parser = ReleaseNotesHTMLParser()
        parser.feed(content_html)
        parser.close()

        # Group info for the entry
        entries.append({
            "date": title_text,
            "updated": updated_text,
            "link": link_href,
            "updates": parser.updates
        })
    
    return entries

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/notes')
def get_notes():
    # If we have cache and it's less than 30 mins old, return it
    if CACHE["data"] is not None and CACHE["last_fetched"] is not None:
        elapsed = (datetime.now() - CACHE["last_fetched"]).total_seconds()
        if elapsed < 1800: # 30 minutes
            return jsonify({
                "source": "cache",
                "last_fetched": CACHE["last_fetched"].isoformat(),
                "data": CACHE["data"]
            })
    
    try:
        data = fetch_and_parse_feed()
        CACHE["data"] = data
        CACHE["last_fetched"] = datetime.now()
        return jsonify({
            "source": "network",
            "last_fetched": CACHE["last_fetched"].isoformat(),
            "data": data
        })
    except Exception as e:
        # If network call fails but we have cache, fallback to cache
        if CACHE["data"] is not None:
            return jsonify({
                "source": "cache_fallback",
                "error": str(e),
                "last_fetched": CACHE["last_fetched"].isoformat(),
                "data": CACHE["data"]
            })
        return jsonify({"error": str(e)}), 500

@app.route('/api/refresh', methods=['POST'])
def force_refresh():
    try:
        data = fetch_and_parse_feed()
        CACHE["data"] = data
        CACHE["last_fetched"] = datetime.now()
        return jsonify({
            "source": "network_forced",
            "last_fetched": CACHE["last_fetched"].isoformat(),
            "data": data
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
