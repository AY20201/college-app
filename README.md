# DSocial

An app to make planning activities easier

## Description

Even at Dartmouth, a school with just over 4,000 undergrads that most would consider a "small," making friends and seeing them on a regular basis is hard. As a first year, I'd consider this aspect of social life the hardest part of being in college. Even going to our primary dining fall, Foco, at the busiest times every day, I often don't recognize anyone there, and to see friends, I have to text them to schedule meetups.

That's why I created DSocial. Let's say you are close with some of the people on your dorm floor and you want to see them at lunch--but you never do. Instead of hoping to find them every time you walk into the dining hall, DSocial allows you to create an online group with them and post activity plans to that group. If any of them are interested in meeting you, they can simply "like" the activity by pressing a virtual thumbs up. Likes are visible to anyone in the group, and depending on individual privacy settings, anyone in the group can message some or all activity "likers" via SMS, if you haven't shared contact info already. Activity plans also dissapear after 45 minutes: if they don't get traction, they don't linger there forever. This eliminates the (what I would consider) slightly awkward step of texting the group chat when you feel a little bit lonely and not getting any response half the time. Activities obviously don't apply to lunch only, either. You can post about absolutely anything, from workouts and hikes to games of pool in Collis or your plans to watch an upcoming football game.  

<br/>
<table>
  <tr>
    <td align="center">
      <img width="200px" alt="Group page" src="https://github.com/user-attachments/assets/8fb170cf-7dbf-4137-a63d-e46ecbf62369" />
      <p>Group page</p>
    </td>
    <td align="center">
      <img width="200" alt="Search page" src="https://github.com/user-attachments/assets/c13bd3fa-a950-41a7-91af-749969cc5463" />
      <p>Search page</p>
    </td>
    <td align="center">
      <img width="200" alt="Group form page" src="https://github.com/user-attachments/assets/5dfc7eb3-9cde-4c10-8f18-bd8611fe4aa1" />
      <p>Add group form</p>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td align="center">
      <img width="200" alt="Message your friends" src="https://github.com/user-attachments/assets/4bfe9cf9-3ee5-4318-b0f7-08eb26ffe45a" />
      <p>Message your friends</p>
    </td>
    <td align="center">
      <img width="200" alt="Group details" src="https://github.com/user-attachments/assets/f1f6b9e8-fe5b-41fe-bf20-94d2ed2219fb" />
      <p>Description page</p>
    </td>
    <td align="center">
      <img width="200" alt="Activity details" src="https://github.com/user-attachments/assets/03a0c635-ff89-40e1-8b87-15e7e2a8682a" />
      <p>Activity details</p>
    </td>
  </tr>
</table>
<br/>

This style of communcation--pressing a single button to say "yes" to an activity and ignoring it otherwise--is designed to reduce the pressure that comes with planning activities or receiving invites. My hope is that the app will allow friends to see each other more often and reduce the frustration of wanting to see people but not knowing how to make it happen.

As for the technical design of the app, I wrote the frontend with React Native (which I have used before) and Typescript (which I was using for the first time). The backend is made up of a MySQL database to store group, activity, and user data, and a Python server created with Flask to handle requests made from the frontend. The server is hosted for free at [pythonanywhere.com](https://www.pythonanywhere.com/) with my endpoint at [https://alxy24.pythonanywhere.com]. Each file in the /app
folder of this project is it's own page, with files in the /components folder containing smaller
subcomponents or helper methods for the other files.

## Installation

First, install [Node.js](https://nodejs.org/en) on your computer.

Clone this repository with the command below:
```
git clone https://github.com/AY20201/college-app
```
After cloning the repository, run the command below in your terminal with the project root folder open:
```
npx expo run:ios
```
If running this project on a Mac, press the "i" key to open IOS simulator, which will prompt you to install the Expo Go app. Press yes. Once installed, the app will run.

The project may also work on an Android device, but I have not tested it.

Without installing and running the project's source code, there is currently no easy way to distribute the app to the public without releasing it on the App Store, which I do not feel ready to do yet and costs $100. I hope the app can be publicly availiable in a more accessible format soon.

## Other links

Check out my [project portfolio](https://ay20201.github.io/portfolio/), a webpage that describes several of my other projects and provides links to their Github repos and store pages.