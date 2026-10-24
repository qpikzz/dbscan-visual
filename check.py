import re,json,os
p=r'C:/Users/qpkzz/Desktop/1/programs/html + css/practic/dbscan-visual/dist/index.html'
s=open(p,encoding='utf-8').read()
m=re.search(r'<title>(.*?)</title>',s)
print('tlen',len(m.group(1)) if m else -1)
i=s.find('name="description"')
print(repr(s[i:i+90]))
d=re.search(r'<meta name="description"\s+content="(.*?)"',s,re.S)
print('dlen',len(d.group(1)) if d else -1)
print('ws',s.count('WebSite'),'wa',s.count('WebApplication'),'ns',s.count('<noscript>'))
scripts=re.findall(r'<script type="application/ld\+json">(.*?)</script>',s,re.S)
print('jsoncount',len(scripts))
for x in scripts:
    json.loads(x)
print('jsonok')
print('robots',os.path.exists(r'C:/Users/qpkzz/Desktop/1/programs/html + css/practic/dbscan-visual/dist/robots.txt'))
print('smap',os.path.exists(r'C:/Users/qpkzz/Desktop/1/programs/html + css/practic/dbscan-visual/dist/sitemap.xml'))
