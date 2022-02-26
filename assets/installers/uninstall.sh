#Clover Rescue Team's official Cloverside software uninstaller

clear && echo -e "\v\033[31mThis program started deleting RescueClover software from your drone. Continue? (y/n): \v\033[0m"
read answer
if [$answer == 'y'] || [$answer == 'Y']
then
pm2 stop /var/www/CRTClover/server.js
pm2 unstartup
sudo rm -r /var/www/CRTClover/
echo 'Complete.'
elif [$answer == 'n'] || [$answer == 'N']
then
echo 'Stopped.'
fi