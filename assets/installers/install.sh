#Clover Rescue Team's official Cloverside software installer

clear && echo -e "\v\033[32mRescueClover installation started. Make sure you have a stable internet connection.\v\033[0m"
echo -e "\v\033[35mDownloading the source code from GitHub...\v\033[0m"
if ! [ -d ./CRTClover/ ]
then
git clone https://github.com/DevMBS/CRTClover.git
echo -e "\v\033[35mInstalling the latest stable version of NodeJS and npm...\v\033[0m"
sudo npm cache clean -f && sudo npm install -g n && sudo n install stable
echo -e "\v\033[35mConnecting to your account...\v\033[0m"
if [ -n "$1" ]
then
echo $1 >> './login.txt'
echo -e "\v\033[35mMoving project folder to /var/www/ ...\v\033[0m"
sudo mkdir /var/www/
sudo mv CRTClover /var/www/
sudo mv ./login.txt /var/www/CRTClover
echo -e "\v\033[35mInstalling required npm modules...\v\033[0m"
cd /var/www/CRTClover && sudo npm install && cd -
echo -e "\v\033[35mSetting up the Rescue Clover server process manager...\v\033[0m"
sudo chmod 777 /var/www/CRTClover/
sudo npm install pm2@latest -g
echo -e "\v\033[35mStarting server and setting it to autoload...\v\033[0m"
pm2 start /var/www/CRTClover/server.js
pm2 startup
if [ -d /home/$USER/.npm-global/ ]
then
sudo env PATH=$PATH:/usr/local/bin /home/$USER/.npm-global/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER
else
sudo env PATH=$PATH:/usr/local/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER
fi
pm2 save
echo -e "\v\033[32mInstallation successfully completed!\v\033[0m"
else
echo "\v\033[31mPlease copy and paste command from the install tutorial correctly!\v\033[0m"
fi
else
echo "\v\033[31mPlease delete all files from previous installations of our software! (sudo rm -r ./CRTClover/)\v\033[0m"
fi