#Clover Rescue Team's official Cloverside software uninstaller

clear && echo -e "\v\033[31mThis program started deleting RescueClover software from your drone. Continue? (y/n): \v\033[0m"
read answer
if [ $answer == y ]
then
pm2 stop /var/www/CRTClover/server.js
pm2 unstartup
sudo rm -r /var/www/CRTClover/
if [ -d /home/$USER/.npm-global/ ]
then
sudo env PATH=$PATH:/usr/local/bin /home/$USER/.npm-global/lib/node_modules/pm2/bin/pm2 unstartup systemd -u $USER --hp /home/$USER
else
sudo env PATH=$PATH:/usr/local/bin /usr/local/lib/node_modules/pm2/bin/pm2 unstartup systemd -u $USER --hp /home/$USER
fi
echo 'Complete.'
elif [ $answer == n ]
then
echo 'Stopped.'
fi