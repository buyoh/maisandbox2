sudo echo -e '#!/bin/sh\ncd' `pwd` '&& npm run start' > /opt/launch_maisandbox.sh
sudo chmod 0755 /opt/launch_maisandbox.sh

cat <<EOF > /etc/systemd/system/maisandbox.service
[Unit]
Description = maisandbox

[Service]
ExecStart = /opt/launch_maisandbox.sh
Restart = no
Type = simple

[Install]
WantedBy = multi-user.target
EOF
sudo systemctl list-unit-files --type=service | grep maisandbox
sudo systemctl enable maisandbox
sudo systemctl start maisandbox
sudo systemctl list-unit-files --type=service | grep maisandbox
