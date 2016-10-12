# Waterplane

An elevation data visualization app using geohash spatial data organization!

## Updates
10/6/2016 - Currently, the app simply visualizes elevation data.  In the future, 
the app will also implement a "waterplane" to visualize areas above and below
an adjustable water level.

## Installation Instructions
1. Install Dependencies
a. `$ npm i`

2. Start an oada-api-server to host the elevation data:
a. `$ git clone https://github.com/OADA/oada-api-server.git`
b. `$ cd oada-api-server`
c. `$ npm i`
d. `$ mkdir data`
e. `$ npm run start`

3. Put data into the server:
a. `$ cd ../Waterplane/OadaServerSetup`
b. `$ vim main.js`
c. Follow the instructions for obtaining a token to use in step d.
d. Run main.js to load .las data to the server:
  i. `$ node main.js <directory with .las data> <server domain> <token>`
  ii. Use included demo data: `$ node main.js ./DemoData localhost:3000 <token>`

4. Run the app
a. Run webpack. `$ webpack`
b. `$ npm run start`
c. The app will start on localhost:8000
d. The app will prompt the user for a data server domain used in step 3., e.g, 'localhost:3000',
e. The user will then be redirected to a login page. Log in with username 'frank' and password 'pass'.
f. To change domains, click the "Change Domain" button in the upper right.
g. To change the user and get a new login token (and clear the cached elevation data), click the "Clear Cache" button in the upper right.
