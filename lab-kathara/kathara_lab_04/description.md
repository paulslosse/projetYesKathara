3 pc differents.
3 interfaces router.

ajout de 2 command sur le pc2.startup.

iptables -A INPUT -s 192.168.1.0/24 -j DROP
iptables -A OUTPUT -d 192.168.1.0/24 -j DROP

Ceci afin de refusé les pings du pc1.

Le pc1 peut ping pc3 mais pas pc2.