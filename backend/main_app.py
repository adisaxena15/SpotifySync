# -*- coding: utf-8 -*-
import base64
import os
import flask
import requests
from urllib.parse import urlparse,parse_qs
import urllib.parse
from dotenv import load_dotenv
import google.oauth2.credentials
import google_auth_oauthlib.flow
import googleapiclient.discovery
import logging
CLIENT_SECRETS_FILE = "client_secret.json"
SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']
API_SERVICE_NAME = 'youtube'
API_VERSION = 'v3'

app = flask.Flask(__name__)
load_dotenv()
app.secret_key = os.getenv('SECRET_KEY')
CLIENT = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
CALLBACK_URL = os.getenv("CALLBACK_URL")


logging.basicConfig(level=logging.INFO)

def get_youtube_playlist_id(url):
    query = urlparse(url).query
    params = parse_qs(query)
    return params.get('list', [None])[0]

def get_spotify_playlist_id(url):
    try:
        parsed_url = urlparse(url)
        path = parsed_url.path
        playlist_id = path.split('/')[2]
        return playlist_id
    except Exception as e:
        print(f"Error parsing URL: {e}")
        return None

@app.route("/api/sync_songs",methods=["GET","POST"])
def sync_songs():
    is_from_frontend = flask.request.args.get('return_json', 'false').lower() == 'true'
    if flask.request.method == "GET":
        if 'credentials' not in flask.session:
            return flask.redirect('authorize')
        if 'spotify_credentials' not in flask.session:
            return flask.redirect('spotify_authorize')
        return flask.render_template('index.html')
    elif flask.request.method == "POST":
        data = flask.request.form
        spotify_playlist_id =get_spotify_playlist_id(data['spotify_url'])
        youtube_playlist_id = get_youtube_playlist_id(data['youtube_url'])
        return start_sync_process(youtube_playlist_id, spotify_playlist_id, is_from_frontend)


def start_sync_process(youtube_playlist, spotify_playlist, is_from_frontend):
    credentials = google.oauth2.credentials.Credentials(
        **flask.session['credentials'])

    youtube = googleapiclient.discovery.build(
        API_SERVICE_NAME, API_VERSION, credentials=credentials)

    channel = youtube.playlistItems().list(
        part="snippet,contentDetails",
        maxResults=25,
        playlistId=youtube_playlist
    ).execute()
    flask.session['credentials'] = credentials_to_dict(credentials)

    new_spotify_ids = []
    song_titles = []
    for item in channel["items"]:
      song_title = item["snippet"]["title"]
      song_titles.append(song_title)
      song_data = search_song_id_in_spotify(song_title)
      if song_data and "tracks" in song_data and "items" in song_data["tracks"] and len(song_data["tracks"]["items"]) > 0:
        newid = song_data["tracks"]["items"][0]["id"]
        new_spotify_id = f"spotify:track:{str(newid)}"
        new_spotify_ids.append(new_spotify_id)
      else:
        logging.warning(f"Skipping a song: {item['snippet']['title']}")
    if is_from_frontend:
        return flask.jsonify({"new_spotify_ids": new_spotify_ids ,"song_titles": song_titles, "spotify_playlist": spotify_playlist})
    else:
        return process_new_songs_in_spotify_playlist(new_spotify_ids, spotify_playlist)
        

@app.route("/api/add_songs_in_spotify_playlist", methods=['POST'])
def add_new_songs_in_spotify_playlist():
    data = flask.request.get_json() 
    songs_list = data.get('songs_list')
    spotify_playlist = data.get('spotify_playlist')
    return process_new_songs_in_spotify_playlist(songs_list, spotify_playlist)

def process_new_songs_in_spotify_playlist(songs_list, spotify_playlist):
    body = {"uris": songs_list}
    headers = {'Authorization': f'Bearer {flask.session["spotify_credentials"]["access_token"]}'}
    playlist_url = f"https://api.spotify.com/v1/playlists/{spotify_playlist}/tracks"
    newrequest = requests.post(playlist_url, json=body, headers=headers)
    if newrequest.status_code == 201:
        """ return "success" """
        return flask.jsonify({"message":"Songs Added SuccessFully"}), 201
    else:
        """ return "failed" """
        return flask.jsonify({"error" : "Failed To Add Songs"}), newrequest.status_code

@app.route('/api/test')
def test_api_request():
  if 'credentials' not in flask.session:
    return flask.redirect('/api/authorize')
  
def refresh_spotify_token():
    try:
        flask.session.modified = True
        data = {
            'grant_type': 'refresh_token',
            'refresh_token': flask.session["spotify_credentials"]['refresh_token']
        }
        encoded_credentials = base64.b64encode(f"{CLIENT}:{CLIENT_SECRET}".encode('utf-8')).decode("utf-8")
        headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': f'Basic {encoded_credentials}'
        }
        response = requests.post("https://accounts.spotify.com/api/token", data=data, headers=headers)
        logging.info(f'Refresh token response status code: {response.status_code}')

        if response.status_code == 200:
            new_credentials = response.json()
            flask.session["spotify_credentials"]['access_token'] = new_credentials['access_token']
            logging.info(f'Access token refreshed successfully. New token: {new_credentials["access_token"]}')
        else:
            logging.error(f'Failed to refresh token: {response.json()}')
            raise Exception('Failed to refresh token')

    except Exception as e:
        logging.error(f"An error occurred while refreshing the token: {e}")
        raise


def search_song_id_in_spotify(song):
    try:
        if "-" in song:
            track = song.split("-")[1].strip()
            artist = song.split("-")[0].strip()
            data = {"q": urllib.parse.quote(f'track:{track} artist:{artist}'), "type": "track", "limit": 1}
            headers = {"Authorization": f"Bearer {flask.session['spotify_credentials']['access_token']}"}
            url = 'https://api.spotify.com/v1/search'
            
            response = requests.get(url, params=data, headers=headers)
            logging.info(f'The status code is {response.status_code}')

            if response.status_code == 401: 
                logging.info("Token might be expired. Attempting to refresh the token.")
                refresh_spotify_token()
                # Fetch the updated token
                new_access_token = flask.session['spotify_credentials']['access_token']
                logging.info(f'Updated access token: {new_access_token}')
                headers = {"Authorization": f"Bearer {new_access_token}"}
                response = requests.get(url, params=data, headers=headers)
                logging.info(f'New response status code after token refresh: {response.status_code}')
            return response.json()
        else:
            logging.error("Song format is incorrect. It should be 'Artist - Track'.")
            return None

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return None


@app.route('/api/authorize')
def authorize():
  is_from_frontend = flask.request.args.get('return_json', 'false').lower() == 'true'
  flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
      CLIENT_SECRETS_FILE, scopes=SCOPES)
  if is_from_frontend:
    redirect_uri = flask.url_for('oauth2callback', _external=True)
  else:
    redirect_uri = flask.url_for('backend_oauth2callback', _external=True)
    
  flow.redirect_uri = redirect_uri
  authorization_url, state = flow.authorization_url(access_type='offline', include_granted_scopes='true')
  flask.session['state'] = state
  if is_from_frontend:
     return flask.jsonify({"authorization_url": authorization_url})
  else:
     return flask.redirect(authorization_url)


@app.route('/api/oauth2callback')
def oauth2callback():
  return process_oauth2callback("http://localhost:3000")

@app.route('/backend_oauth2callback')
def backend_oauth2callback():
  return process_oauth2callback(flask.url_for('test_api_request', _external=True))

def process_oauth2callback(redirect_url):
    state = flask.session['state']
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
      CLIENT_SECRETS_FILE, scopes=SCOPES, state=state)
    if redirect_url=='http://localhost:3000':
        flow.redirect_uri = flask.url_for('oauth2callback', _external=True)
    else:
        flow.redirect_uri = flask.url_for('backend_oauth2callback', _external=True)
    authorization_response = flask.request.url
    flow.fetch_token(authorization_response=authorization_response)
    credentials = flow.credentials
    flask.session['credentials'] = credentials_to_dict(credentials)
    return flask.redirect(redirect_url)

@app.route('/api/revoke')
def revoke():
  if 'credentials' not in flask.session:
    return ('You need to <a href="authorize">authorize</a> before ' +
            'testing the code to revoke credentials.')

  credentials = google.oauth2.credentials.Credentials(
    **flask.session['credentials'])

  revoke = requests.post('https://oauth2.googleapis.com/revoke',
      params={'token': credentials.token},
      headers = {'content-type': 'application/x-www-form-urlencoded'})

  status_code = getattr(revoke, 'status_code')
  if status_code == 200:
    return('Credentials successfully revoked.')
  else:
    return('An error occurred.' )


@app.route('/api/clear')
def clear_credentials():
  if 'spotify_credentials' in flask.session:
    del flask.session['spotify_credentials']
  if 'credentials' in flask.session:
    del flask.session['credentials']
  return 'Credentials have been cleared'


def credentials_to_dict(credentials):
  return {'token': credentials.token,
          'refresh_token': credentials.refresh_token,
          'token_uri': credentials.token_uri,
          'client_id': credentials.client_id,
          'client_secret': credentials.client_secret,
          'scopes': credentials.scopes}

@app.route("/api/spotify_authorize")
def spotify_authorize():
    is_from_frontend = flask.request.args.get('return_json', 'false').lower() == 'true'
    CALLBACK_Uri = 'http://localhost:5173/backend_spotify_callback' if not is_from_frontend else CALLBACK_URL
    scopes = 'playlist-modify-private playlist-modify-public'
    params = {"client_id":CLIENT, 
              "response_type":"code",
              "redirect_uri": CALLBACK_Uri,
              "show_dialog" : True,
              "scope": scopes
              }
    params_encoded = urllib.parse.urlencode(params)
    authorize_url = f'https://accounts.spotify.com/authorize?{params_encoded}'

    if is_from_frontend:
       return flask.jsonify({"authorize_url": authorize_url})
    else:
       return flask.redirect(authorize_url)


@app.route("/api/spotify_callback")
def spotify_callback():
    return process_spotify_callback("http://localhost:3000", 'frontend') 


@app.route("/backend_spotify_callback")
def backend_spotify_callback():
    return process_spotify_callback(flask.url_for('sync_songs'), 'backend')

def process_spotify_callback(redirect_url, is_frontend):
    if is_frontend == 'frontend':
       CALLBACK_Uri = CALLBACK_URL
    else:
       CALLBACK_Uri = 'http://localhost:5173/backend_spotify_callback'

    newcode = flask.request.args.get("code")
    newtoken = request_access_token(newcode, CALLBACK_Uri)
    flask.session["spotify_credentials"] = newtoken
    return flask.redirect(redirect_url)

@app.route("/api/spotify_after_callback")
def spotify_after_callback():
    return dict(flask.session)

def request_access_token(code, CALLBACK_Uri):
    params = {
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": CALLBACK_Uri
    }
    headers = {
        'content-type': 'application/x-www-form-urlencoded',
        "Authorization": "Basic "+ base64.b64encode(f"{CLIENT}:{CLIENT_SECRET}".encode('utf-8')).decode('utf-8')
    }
    newpost_url = "https://accounts.spotify.com/api/token"
    newpost_request = requests.post(newpost_url,data=params, headers=headers)
    return newpost_request.json()

if __name__ == '__main__':
  #     When running in production *do not* leave this option enabled.
  os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
  app.run('localhost', 5173, debug=True)