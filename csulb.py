import sys
from google.appengine.api import urlfetch
from bs4 import BeautifulSoup

reload(sys)
sys.setdefaultencoding('utf8')
urlfetch.set_default_fetch_deadline(60)

def title(string):
    return string[0].upper() + string[1:].lower()

def get_subjects(term, year):
    url_template = 'http://web.csulb.edu/depts/enrollment/registration/class_schedule/{}_{}/By_Subject/'
    url = url_template.format(title(term), year)
    request = urlfetch.fetch(url)
    soup = BeautifulSoup(request.content)
    indexList = soup.find('div', 'indexList')
    listItems = indexList.find_all('li')
    anchors = [li.find('a') for li in listItems]
    urls = [a.get('href') for a in anchors]
    for url in urls:
        yield url.split('.')[0]

def get_soc(term, year, subject):
    url_template = 'http://web.csulb.edu/depts/enrollment/cgi-bin/soc_feed.pl?term={}&year={}&subject={}'
    url = url_template.format(term, year, subject.upper())
    request = urlfetch.fetch(url)
    soup = BeautifulSoup(request.content)
    tables = soup.find_all('table')
    for table in tables:
        d, t, l = 0, 0, 0
        heads = table.find_all('th')
        for i, th in enumerate(heads):
            for content in th.contents:
                if content == 'DAYS':
                    d = i
                elif content == 'TIME':
                    t = i
                elif content == 'LOCATION':
                    l = i
        if d or t or l:
            rows = table.find_all('tr')
            for tr in rows:
                cells = tr.find_all('td')
                soc = {}
                for i, td in enumerate(cells):
                    for content in td.contents:
                        if i == d - 1:
                            soc.setdefault('days', content)
                        elif i == t - 1:
                            soc.setdefault('time', content)
                        elif i == l - 1:
                            soc.setdefault('location', content)
                if soc:
                    yield soc

def get_entire_soc(term, year):
    try:
        subjects = get_subjects(term, year)
        for subject in subjects:
            for soc in get_soc(term, year, subject):
                yield soc
    except:
        pass
