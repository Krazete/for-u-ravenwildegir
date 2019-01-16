import re
from google.appengine.ext import ndb
from csulb import get_entire_soc

class Schedule(ndb.Model):
    building = ndb.StringProperty()
    room = ndb.StringProperty()
    times = ndb.JsonProperty()

class Winter(Schedule):
    pass

class Spring(Schedule):
    pass

class Summer(Schedule):
    pass

class Fall(Schedule):
    pass

def scrape(term, year):
    model = get_term_model(term)
    database = {}
    keys = model.query().fetch(keys_only=True)
    socs = get_entire_soc(term, year)
    for soc in socs:
        if soc['days'] == 'TBA' or soc['time'] == 'TBA' or soc['location'] == 'TBA':
            continue
        days = parse_days(soc['days'])
        time = parse_time(soc['time'])
        building, room = parse_location(soc['location'])
        database.setdefault(building, {})
        database[building].setdefault(room, [[], [], [], [], [], [], []])
        for i, day in enumerate(days):
            if day:
                database[building][room][i].append(time)
    for building in database:
        for room in database[building]:
            id = '-'.join([building, room])
            schedule = model(id=id, building=building, room=room, times=database[building][room])
            key = schedule.put()
            if key in keys:
                keys.remove(key)
    if database: # never leave a database completely empty
        ndb.delete_multi(keys)

def get_term_model(term):
    if term == 'Winter':
        return Winter
    elif term == 'Spring':
        return Spring
    elif term == 'Summer':
        return Summer
    elif term == 'Fall':
        return Fall
    else:
        return Schedule

def parse_days(days):
    return [
        'Su' in days,
        'M' in days,
        'Tu' in days,
        'W' in days,
        'Th' in days,
        'F' in days,
        'Sa' in days
    ]

def parse_location(location):
    return location.split('-', 1)

def parse_time(time):
    pattern = re.compile('(\d+(?::\d+)?)-(\d+:\d+)([AP]M)')
    match = pattern.match(time)
    a, b, c = match.groups()
    if ':' in a:
        aa, ab = a.split(':', 1)
        ac = int(aa) + int(ab) / 60.0
    else:
        ac = int(a)
    if ':' in b:
        ba, bb = b.split(':', 1)
        bc = int(ba) + int(bb) / 60.0
    else:
        bc = int(b)
    if c == 'PM':
        if bc < 12:
            if ac < bc:
                ac += 12
            bc += 12
    return ac, bc
