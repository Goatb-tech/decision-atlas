import json
import os
from pathlib import Path
import socket
import subprocess
import time
import urllib.error
import urllib.request

root = Path(__file__).resolve().parents[1]
with socket.socket() as sock:
    sock.bind(('127.0.0.1', 0))
    port = sock.getsockname()[1]
env = {**os.environ, 'PORT': str(port), 'HOST': '127.0.0.1', 'SQLITE_PATH': ':memory:', 'APP_ORIGIN': 'http://localhost:5173'}
server = subprocess.Popen(['node', '--import', 'tsx', 'server/index.ts'], cwd=root, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

def request(path, method='GET', body=None, cookie=None, origin=None):
    headers = {'Content-Type': 'application/json'}
    if cookie: headers['Cookie'] = cookie
    if origin: headers['Origin'] = origin
    req = urllib.request.Request(f'http://127.0.0.1:{port}/api' + path, method=method, headers=headers, data=json.dumps(body).encode() if body is not None else None)
    try:
        response = urllib.request.urlopen(req)
    except urllib.error.HTTPError as error:
        response = error
    raw = response.read()
    return response.status, json.loads(raw) if raw else None, (response.headers.get_all('Set-Cookie') or [None])[-1]

try:
    for _ in range(100):
        try:
            if request('/health')[0] == 200: break
        except (OSError, urllib.error.URLError):
            if server.poll() is not None: raise RuntimeError(server.stderr.read().decode())
            time.sleep(0.1)
    assert request('/users/unknown/bootstrap')[0] == 401
    assert request('/auth/register', 'POST', {'name':'Alice', 'email':'alice@example.com', 'password':'sample-password-123'}, origin='https://attacker.example')[0] == 403
    users = []
    for name in ['alice', 'bob']:
        code, data, cookie = request('/auth/register', 'POST', {'name':name, 'email':name+'@example.com', 'password':'sample-password-123'})
        assert code == 201, (code, data)
        assert 'HttpOnly' in cookie and 'SameSite=Strict' in cookie
        users.append((data['user']['id'], cookie.split(';')[0]))
    alice, bob = users
    assert request('/auth/me', cookie=alice[1])[1]['user']['id'] == alice[0]
    assert request('/users/'+alice[0]+'/bootstrap', cookie=alice[1])[0] == 200
    assert request('/users/'+alice[0]+'/bootstrap', cookie=bob[1])[0] == 403
    code, data, _ = request('/scenarios', 'POST', {'userId':alice[0], 'title':'Private', 'initialOptions':[{'label':'A'},{'label':'B'}]}, cookie=alice[1])
    assert code == 201, data
    scenario = data['scenario']['id']
    assert request('/scenarios/'+scenario+'?userId='+alice[0], cookie=bob[1])[0] == 403
    assert request('/scenarios/'+scenario+'?userId='+bob[0], cookie=bob[1])[0] == 404
    assert request('/scenarios/'+scenario, 'PATCH', {'userId':alice[0], 'title':'Stolen'}, cookie=bob[1])[0] == 403
    assert request('/auth/logout', 'POST', {}, cookie=alice[1])[0] == 204
    assert request('/auth/me', cookie=alice[1])[0] == 401
    assert request('/auth/me', cookie='decision_atlas_session='+'a'*64)[0] == 401
    assert request('/auth/login', 'POST', {'email':'alice@example.com','password':'wrong'})[0] != 200
    print('Decision Atlas: anonymous/forged sessions, cross-user reads and writes, CSRF, login, logout revocation passed.')
finally:
    server.terminate()
    server.wait(timeout=10)
