# The Clover Rescue Project

[CopterHack-2022](copterhack2022.md), 
Clover Rescue Team - When something went wrong.

## Team information

### The list of team members:

Кирилл Лещинский, [@k_leshchinskiy](https://t.me/k_leshchinskiy) - TeamLead.<br/>
Кузнецов Михаил, [@fletchling_dev](https://t.me/fletchling_dev) - Software developer.<br/>
Роман Сибирцев, [@r_sibirtsev](https://t.me/r_sibirtsev) - Tech Specialist/Python programmer.<br/>
Даниил Валишин, [@Astel_1](https://t.me/Astel_1) - Hardware engineer/tester.

# Project description

### Table of contents:
1.	[Idea](#idea)
2.	[How it works](#hiw)
3.	[Required hardware](#rh)
4.	[Operating Instructions](#oi)
5.	[Installation instructions](#ii)
6.	[Work example/functions](#functions)
7.	[Settings](#settings)
8.	[Mobile version](#mobile)
<br/><br/>
## <a name="idea"></a> Project Idea

The idea of this project came immediately, it lies on the surface. A system that makes situations where pilots cannot find their flown away drone or stop it at full speed flying into a wall, a thing of the past, is something that pilots have been missing for a long time.
The key feature of our software is that users can manage their Clover from anywhere in the world, this software replaces FTP and SSH (users can upload the code to their drone and run it directly from our site). Also, if radio communication with the Clover is lost, it can be returned to the user's or takeoff location with just one click. Moreover, the user can monitor the status in realtime, as well as location, camera data, and airborne position data of the drone. There are also functions that can be useful in emergency situations, such as landing, hovering and disarming the drone remotely from our website. A mobile version of the site with full functionality is also available! 
<br/><br/><br/>
<img src='./assets/readme/mockup.png'>

## <a name="hiw"></a> How It Works

Links to repositories:
1.	https://github.com/DevMBS/CRTClient
2.	https://github.com/DevMBS/CRTClover

The first repository is the main server that users and their drones connect to. This server provides communication and control of the drone through a user-friendly interface.
The second repository represents the server that runs on the drone and connects to the main server. This server reads and transmits telemetry to the main server (which is displayed as a 3-D visualization). It also takes commands from the user and executes them.
The Socket.IO library is used to transfer data between the client, server and drone.
After connecting the client and the drone to the server, they are added to a unique room with their UID, and already in it they exchange data.
You can learn more about how it works by visiting the repositories.

## <a name="rh"></a> Required Hardware

All you need is COEX Clover 3/4, Raspberry PI 3/4, USB WIFI Modem and RPI Camera!

## <a name="oi"></a> Operating Instructions

Firstly, users need to register on our website.

<img src='./assets/readme/signup.png'><br/><br/>
After registration the main control panel and installation instructions open.

## <a name="ii"></a> Installation Instructions

First, you need to connect to your Clover via SSH and paste the command indicated in the instructions that opened (if it is not open, you can open it by clicking on the "Instructions" button). The command looks like that:<br/>
<code>wget https://48c5-94-29-124-254.eu.ngrok.io/assets/installers/install.sh && sudo chmod 777 ./install.sh && ./install.sh #UID</code><br/>
When the software is installed, the server will automatically start. After installation, you can forget about manually launching the software, it will automatically start and connect to the main server after turning on the Сlover!

## <a name="functions"></a> Work Example, Functions
<br/>
<img src='./assets/readme/main.png'><br/><br/>
On the website there are several commands for controlling the drone. “Get photo” allows you to get an image from the drone camera. The “Land” button lands the drone. The "Return" command returns drone to the operator, according to GPS coordinates (this requires a stable connection of the drone with 10 or more satellites). "Hover" makes the drone hover in the air. "Disarm" instantly disables the drone's motors, so you need to be careful with this command. The “Choose Code” and “Upload & Run” buttons allow users to select a code written in Python, upload it to the drone and run it. Also, users will see output of their code and all its errors. There is also interactive map with markers, blue marker the is location of the user, purple marker is the location of his drone. Also, as you can see, there is a real-time visualization of the Clover’s airborne position, as well as its altitude and the average voltage between the battery cells.

## <a name="settings"></a> Settings
<br/>
<img src='./assets/readme/allsettings.png'><br/><br/>
In the settings users can set speed and altitude of the return.<br/>
<img src='./assets/readme/s1.png'><br/><br/>
Users can choose an action after return (hover or land).<br/>
<img src='./assets/readme/s2.png'><br/><br/>
...And the place where the drone will return (User coordinates or takeoff coordinates).<br/>
<img src='./assets/readme/s3.png'><br/><br/>

Users can also set the period for automatically receiving photos from the drone. <br/>
<img src='./assets/readme/s4.png'><br/><br/>
At the top of the website is the status of your drone (Disconnected/Connected, disarmed, Connected, in flight).<br/>
<img src='./assets/readme/status.png'><br/><br/>

## <a name="mobile"></a> Mobile Version
<br/>
The mobile version of the site has absolutely the same functionality (swipe to the right/left to move between control panels).<br/><br/>
<p float = "left">
<img src='./assets/readme/m1.jpg' width= '200px'>
<img src='./assets/readme/m2.jpg' width= '200px'>
<img src='./assets/readme/m3.jpg' width= '200px'>
<img src='./assets/readme/m4.jpg' width= '200px'>
<img src='./assets/readme/m5.jpg' width= '200px'>
</p>
