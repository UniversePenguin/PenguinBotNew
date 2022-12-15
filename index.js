const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');

//Splits String at Multiple Points
function splitMulti(str, tokens){
    var tempChar = tokens[0];
    for(var i = 1; i < tokens.length; i++){
        str = str.split(tokens[i]).join(tempChar);
    }
    str = str.split(tempChar);
    return str;
}

//Call Stored Variables
function readStored(requested) {
    var stored = fs.readFileSync('txtFiles/storedVariables.txt', "utf8").split('\n');
    stored.splice(0, 2);
    var newStored = stored.join(';');
    var newStored = splitMulti(newStored, ['\n', ' = ', ';', '\r']);
    if (newStored[newStored.indexOf(requested) + 1] === 'mode') {
        console.log('Invalid variable request: ' + requested);
    }
    return newStored[newStored.indexOf(requested) + 1];
}

//Change a Stored Variable
function changeStored(variableName, newValue) {
    var stored = fs.readFileSync('txtFiles/storedVariables.txt', "utf8").split('\n');
    stored.splice(0, 2);
    var stored = stored.join(';');
    var stored = splitMulti(stored, ['\n', ' = ', ';', '\r']);
    var tempStored = [];
    for (var i = 0; i < stored.length; i = i + 2) {
        tempStored.push(stored[i]);
        tempStored.push(stored[i + 1]);
    }
    var stored = tempStored;
    stored[stored.indexOf(variableName) + 1] = newValue;

    var LineByLine = [];
    for (var i = 0; i < stored.length; i = i + 2) {
        LineByLine.push(stored[i] + ' = ' + stored[i + 1]);
    }
    LineByLine.splice(0, 0, 'List of stored variables', '');
    var LineByLine = LineByLine.join('\n');
    fs.writeFileSync('txtFiles/storedVariables.txt', LineByLine, 'utf8');
}

//Adds/Removes the role of a user
function changeRole(message) {
    var availableRoles = JSON.parse(fs.readFileSync('servers.json', 'utf8'));
    var availableRoles = availableRoles.availableRoles[availableRoles.availableRoles.indexOf(message.guild.id) + 1];

    var requestedRole = message.content.split(' ');
    requestedRole.splice(0, 1);
    var requestedRole = requestedRole.join(' ');
    var requestedRole = findObject('role_Name', message.guild, requestedRole).id;

    if (message.guild.roles.has(requestedRole) == true && availableRoles.indexOf(findObject('role_ID', message.guild, requestedRole).name) > -1) {
        if (message.member.roles.has(requestedRole) == false) {
            message.member.addRole(requestedRole);
            message.channel.send(message.author + ', I\'ve given you the role!');
            console.log(message.author.username + ' was given the role ' + findObject('role_ID', message.guild, requestedRole).name);
        } else {
            message.member.removeRole(requestedRole);
            message.channel.send(message.author + ', I\'ve removed the role from you!');
            console.log(message.author.username + ' was released from the role ' + findObject('role_ID', message.guild, requestedRole).name);
        }
    } else {
        message.channel.send(message.author + ' that role doesn\'t exist or isn\'t available! (the roles are case sensitive)');
    }
}

//Find a user using a given parameter
function findObject(infoType, server, info){
    var toReturn = '';
    switch (infoType) {
        case 'user_Name':
            if (server.members.map(g => g.displayName).indexOf(info) != -1) {
                toReturn = server.members.get(Array.from(server.members.keys())[server.members.map(g => g.displayName).indexOf(info)]);

            } else {
                toReturn = bot;
                console.log('couldn\'t find user with name ' + info + ' in ' + server.name);
            }
            break;
        case 'user_ID':
            if (server.members.map(g => g.id).indexOf(info) != -1) {
                toReturn = server.members.get(Array.from(server.members.keys())[server.members.map(g => g.id).indexOf(info)]);

            } else {
                toReturn = bot;
                console.log('couldn\'t find user with id ' + info + ' in ' + server.name);
            }
            break;
        case 'role_Name':
            if (server.roles.map(g => g.name).indexOf(info) != -1) {
                toReturn = server.roles.get(Array.from(server.roles.keys())[server.roles.map(g => g.name).indexOf(info)]);
            } else {
                toReturn = bot;
                console.log('couldn\'t find role with name ' + info + ' in ' + server.name);
            }
            break;
        case 'role_ID':
            if (server.roles.map(g => g.id).indexOf(info) != -1) {
                toReturn = server.roles.get(Array.from(server.roles.keys())[server.roles.map(g => g.id).indexOf(info)]);
            } else {
                toReturn = bot;
                console.log('couldn\'t find role with id ' + info + ' in ' + server.name);
            }
            break;
    }
    return toReturn;
}

//Word Translator
function translateWord(txtFile, index) {
    var words = fs.readFileSync(txtFile, "utf8").split('\n');
    var words = words.join(';');
    var words = splitMulti(words, ['\n', ' = ', ';', '\r']);
    var index = index.toString();

    //--Cleanup--
    var tempStored = [];
    for (var i = 0; i < words.length; i = i + 3) {
        tempStored.push(words[i]);
        tempStored.push(words[i + 1]);
    }
    var words = tempStored;
    //--Cleanup End--

    var toReturn;
    for (var i = 0; i < words.length; i++) {
        if (words[i] === index) {
            toReturn = words[i+1];
        }
    }
    return toReturn;
}

//Consenter
function checkConsent(id) {
    var consentIDs = fs.readFileSync('txtFiles/consenter.txt', "utf8").split('\n');
    var consentIDs = consentIDs.join(';');
    var consentIDs = splitMulti(consentIDs, ['\n', ';', '\r']);

    //--Cleanup--
    var tempStored = [];
    for (var i = 0; i < consentIDs.length; i = i + 2) {
        tempStored.push(consentIDs[i]);
    }
    var consentIDs = tempStored;
    //--Cleanup End--

    var toReturn;
    if (consentIDs.includes(id) === true) {
        toReturn = 'found';
    } else {
        consentIDs.push(id);
        var newFile = consentIDs.join('\n');
        fs.writeFileSync('txtFiles/consenter.txt', newFile);
        toReturn = 'added';
    }
    return toReturn;
}

//Basic Setup
bot.on('ready', () => {
    bot.user.setPresence({ game: {name: 'the server!', type:3}, status: 'online'});
    console.log('Ready to go!');
})

//Debug Command
bot.on('message', (message) => {
    if (message.author.id == '148517700220616714' && message.content === 'penguinbot.test' && message.guild.available == true) {
    }
})

//Shannon's Command
bot.on('message', (message) => {
    if (message.author.id == '275012975385903104' && message.content.includes('callout') == true && message.guild.available == true && readStored('enable-shannon') == 't') {
        var CalledOutUser = message.guild.members.get(Array.from(message.guild.members.keys())[message.guild.members.map(g => g.displayName).indexOf(message.content.split(': ')[1])]);
        var randomInsult = '';
        switch (Math.floor(Math.random() * 7)) {
            case 0:
                randomInsult = 'stupid';
                break;
            case 1:
                randomInsult = 'ugly';
                break;
            case 2:
                randomInsult = 'lame';
                break;
            case 3:
                randomInsult = 'dumb';
                break;
            case 4:
                randomInsult = 'loser';
                break;
            case 5:
                randomInsult = 'tot';
                break;
            case 6:
                randomInsult = 'idiot';
                break;
        }
        message.channel.send(CalledOutUser + ' is BIG ' + randomInsult);
    } else if (message.author.id == '275012975385903104' && message.content.includes('callout') == true && message.guild.available == true && readStored('enable-shannon') == 'f') {
        message.channel.send('Not right now, shannon.');
    }
})

//Servant Mode Commands
bot.on('message', (message) => {
    if (readStored('mode') == 'servant') {
        //'add ranks' command
        if (message.author.id == '148517700220616714' && message.content.includes('add ranks') == true && message.guild.available == true) {
            console.log(message.guild.roles.map(g => g.name).join(', '));
            var guildRoles = message.guild.roles.map(g => g.name);
            guildRoles.splice(guildRoles.indexOf('@everyone'), 1);

            console.log(guildRoles);

            var exclusions = [];

            if (message.content.includes(':') == true) {
                exclusions = message.content.split(': ')[1].split(', ');
            }

            var rolesToAdd = guildRoles.length - exclusions.length;

            message.channel.send('Adding ' + rolesToAdd + ' roles!');

            var currentRole = 0;
            var typer = setInterval(function(){
                if (guildRoles[currentRole] == undefined) {
                    message.channel.send('DONE!');
                    clearInterval(typer);
                }
                console.log('Attempting to add: ' + guildRoles[currentRole]);

                if (exclusions.indexOf(guildRoles[currentRole]) == -1 && guildRoles[currentRole] != undefined) {
                    message.channel.send('!addrank ' + guildRoles[currentRole]);
                    console.log('Adding ' + guildRoles[currentRole]);
                } else {
                    console.log('Couldn\'t add ' + guildRoles[currentRole]);
                }

                currentRole++
            }, 10000);
        }
    }
})

//Normal Mode Commands
bot.on('message', (message) => {
    var serverInfo = JSON.parse(fs.readFileSync('servers.json', 'utf8'));
    if (readStored('mode') == 'normal' && message.content.startsWith('!') == true && message.guild.id !== '531996042774970369') {
        switch (message.content.split(' ')[0]) {
            case '!role':
                changeRole(message);
                break;
            case '!roles':
                var roles = serverInfo.availableRoles[serverInfo.availableRoles.indexOf(message.guild.id) + 1];
                message.channel.send('The list of available roles is:\n' + roles.join('\n'));
                break;
            case '!help':
                message.channel.send(message.author + ', the following command are available:\n``!role [insert role here]`` - Gives/Removes a given role\n``!roles`` - Shows a list of all available roles');
                break;
            case '!addrole':
                if (message.member.hasPermission('ADMINISTRATOR') == true) {
                    var roles = serverInfo.availableRoles[serverInfo.availableRoles.indexOf(message.guild.id) + 1];
                    var roleToAdd = message.content.split(' ');
                    roleToAdd.splice(0, 1);
                    roles.push(roleToAdd.toString());
                    serverInfo.availableRoles[serverInfo.availableRoles.indexOf(message.guild.id) + 1] = roles;
                    fs.writeFileSync('servers.json', JSON.stringify(serverInfo), 'utf8');
                    console.log(message.author.username + ' added the role ' + roleToAdd.toString() + ' in ' + message.guild.name);
                    message.channel.send('I\'ve added the role \'' + roleToAdd.toString() + '\' to the list of available commands!');
                }
                break;
            case '!fixdumbbot':
                if (message.author.id === '148517700220616714') {
                    message.channel.send('Fixed!');
                }
                break;
            case '!resetnames':
                var allUsers = Array.from(message.guild.members.values());
                
                for (i = 0; i < allUsers.length; i++) {
                    allUsers[i].setNickname(allUsers[i].user.username)
                        .then(console.log)
                        .catch(console.error);
                }
                message.reply('Done!');
                break;
            case '!beancake':
                
                if (message.author.id == '148517700220616714' || message.author.id == '98931992678137856' || message.author.id == '217087135956598784') {
                    message.channel.sendFile('rice-crispy-treat.jpg', "rice-crispy-treat.jpg", "Here you go!");
                }

                break
            default:
                if (message.guild.id !== '346499090768592896' && message.channel.id === '412456708737204244') {
                    message.reply('Invalid Command!');
                }
                break;
        }
    } else if (readStored('mode') != 'normal' && message.content.startsWith('!') == true) {
        message.channel.send(message.author + ' I\'m currently off doing a different task! Try again later to see if I\'m back!');
    }
})

//Personal Commands
bot.on('message', (message) => {
    if (readStored('allow-personal-commands') == 't' && message.author.bot != true && message.guild.id !== '346499090768592896' && message.guild.id !== '531996042774970369') {
        var msg = message.content.toLowerCase();
        if (msg.includes('fuck') && msg.includes('you') && msg.includes('grace')) {
            message.channel.send('Yea, fuck you Grace!');
        } else if (msg.includes('fuck') && msg.includes('you') && msg.includes('bagel')) {
            message.channel.send('Yea, fuck you Bagel!');
        }
    }
})

//General behavior
bot.on('message', (message) => {
    //Pin all number codes in Nugget Town
    if (message.channel.id == '293901557739814912' && /[a-zA-Z]/.test(message.content) == false && message.author.bot == false && message.content.length == 8) {
        message.pin();
        message.channel.send('Nice! All numbers!');
    }
    if (message.guild.id === '163531369232728064' && message.content === '!homie' && message.member.hasPermission('ADMINISTRATOR') == true) {
        message.channel.send('!!ATTENTION RESIDENTS!! PLEASE NOTE THAT FROM THIS POINT FORWARD THIS SERVER HEAVILY ENCOURAGES AND ADVISES HOMIESEXUAL VIBES. IF YOU CANNOT TUCK YA HOMIES INTO BED GO KICK ROCKS :))')
    }
    if (message.guild.id === '163531369232728064' && message.content === '!positivity' && message.member.hasPermission('ADMINISTRATOR') == true) {
        message.channel.send('!!ATTENTION VIEWERS!! PLEASE NOTE THAT FROM THIS POINT FORWARD THIS STREAM HEAVILY ENCOURAGES AND ADVISES POSITIVE VIBES. IF YOU CANNOT HANDLE THE HAPPINESS GO KICK ROCKS :))')
    }
    if (message.guild.id === '163531369232728064' && message.content === '!positivity' && message.member.hasPermission('ADMINISTRATOR') !== true) {
        message.delete();
    }
    if (message.guild.id === '163531369232728064' && message.content === '!homie' && message.member.hasPermission('ADMINISTRATOR') !== true) {
        message.delete();
    }
})

//Zeebee Behaviour
bot.on('message', (message) => {
    if(message.author.bot !== true && message.guild.id === '531996042774970369') {
        var msg = message.content.toLowerCase();

        //Fuck you grace response
        if (msg.includes('fuck') && msg.includes('you') && msg.includes('grace')) {
            message.channel.send('Yea, fuck you Grace!');
        } else if (msg.includes('fuck') && msg.includes('you') && msg.includes('bagel')) {
            message.channel.send('Yea, fuck you Bagel! \n' + findObject('user_ID', message.guild, '228742749971677194'))
        } else if (msg.includes('fuck') && msg.includes('you') && msg.includes('bullets')) {
            message.channel.send('Yea, fuck you Bullets! \n' + findObject('user_ID', message.guild, '128042275883319296'))
        } else if (msg.includes('fuck') && msg.includes('you') && msg.includes('blue')) {
            message.channel.send('Yea, fuck you Blue! \n' + findObject('user_ID', message.guild, '406935498431660034'))
        }

        //Cars Name Changer
        if (message.author.id === '98964911178133504'){
            var part1 = translateWord('txtFiles/carsNameGen.txt', Math.floor(Math.random() * 19) + 1);
            var part2 = translateWord('txtFiles/carsNameGen.txt', Math.floor(Math.random() * 24) + 20);
            if (Math.floor(Math.random() * 64) === 63) {
                part2 = part2 + translateWord('txtFiles/carsNameGen.txt', Math.floor(Math.random() * 6) + 43);
            }
            var part3 = 'Cars';
            message.member.setNickname(part1+part2+part3);
            console.log('name change!');
        }
        //!Consent Command
        if (message.content.toLowerCase() === '!consent') {
            if (checkConsent(message.author.id) === 'found') {
                message.channel.send('You\'ve already added yourself to the list.');
            } else {
                message.channel.send('I added you to the list.');
                console.log('Added ' + message.author.username + ' to the list of consenters.');
            }
        }

        //Fuck you messages
        if (msg.includes('fuck') && msg.includes('you')) {
            if (checkConsent(message.author.id) === 'found') {
                var fuckedUser = null;
            }
        }
    }

})
  
bot.login(readStored('login-token'));