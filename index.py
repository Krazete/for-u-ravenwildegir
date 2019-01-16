import webapp2
import json
from scrape import get_term_model

class Index(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/html'
        content = open('index.html').read()
        self.response.write(content)

class Data(webapp2.RequestHandler):
    def post(self):
        self.response.headers['Content-Type'] = 'application/json'
        term = self.request.get('term', 'Winter')
        model = get_term_model(term)
        database = {}
        for schedule in model.query().fetch():
            building = schedule.building
            room = schedule.room
            database.setdefault(building, {})
            database[building].setdefault(room, schedule.times)
        datajson = json.dumps(database)
        self.response.write(datajson)

sitemap = [
    ('/', Index),
    ('/data.json', Data)
]

app = webapp2.WSGIApplication(sitemap, debug=True)
