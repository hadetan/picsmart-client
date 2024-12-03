# PicsMart Project Notes (FrontEnd)

## Authentication

First I created the react app using `npx create-react-app .` and then deleted all of the boiler files and codes. I have setup the index.css file as well with this -

```css
* {
  padding: 0;
  margin: 0;
}

html, body {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  /* Rest are default */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

Now lets create two folders inside `src`, pages and components. Inside pages create a folder login and inside `Login.js` and signup folder and inside `Signup.js`.

### SASS

Instead of using plain css we will be using `SASS` which is a lot better compared to plain css in big production projects.

Install SASS -

```bash
npm i sass
```

Now create sass files inside both login & signup folders using `.scss` file extension. After creating both login and signup pages I created home page where I only created the function and exported it.

In SASS we can nest like this -

```scss
.div1 {
    //Your stylings

    //Then add the next nested div inside it (if available)
    .div2 {
        // Your stylings

        // ...And so on
    }
}

// ...And so on
```

### React Router Dom

This package helps us to create pages in different paths, for example if we do `yourUrl/login` then if we set our router path to /login, it will redirect us to login page.

To install -

```bash
npm i react-router-dom
```

To use it -

```javascript
import { Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} />
    </Routes>
  );
};
```

***Note: We always create routes in our route component***

### Axios

Axios is a very fast downloading package that helps us to segregate our requests to API with GET, POST... and so on. Using axios we can intercept our API's, it would be impossible with fetch function. Why do we need to intercept the API's? We will understand it soon.

To install -

```bash
npm i axios
```

I will create a `Utils` inside which I will create `axiosClient.js` file. Now inside this file I will create a variable while exporting it while assigning the variable with `axios.create()` function and configure few things inside it like this -

```javascript
import axios from 'axios';

export const axiosClient = axios.create({
  //We can define our base url here so we will not have to type it again and again.
  baseURL: 'http://localhost:4000/v1',
  withCredentials: true, //Helps us to send cookies from frontend to backend.
});
```

Now if we implement this API post call in our login page, it will throw us an error saying `Access to XMLHttpRequest at 'http://localhost:4000/v1/auth/login' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.`

What this is basically saying is that, following the CORS policy which says that two individual http's cannot communicate with each other by default. Imagine if someone finds your backends URL, they can easily create a small web page and access your backend without your own protected web app. It is not a good idea. That is why by default every browser blocks the request that are running on separate IP Addresses. So that it can be more secure from hackers. To allow our frontend, go back to backends README.md file and go to CORS section.

After allowing our frontend, and when you do login, it sends the response and when you go to `application -> cookies -> localhost..` you will see the cookie being set with our refresh token which was sent and set by our backend using `cookie-parser` package.

Now we will save this access token which is coming from the response of the API, it is our own responsibility to save the token to the local storage.

We will create a new file which will handle the token to save in the local storage, the file will be named `localStorageManager.js` and inside it we will create three exported functions.

```javascript
export const KEY_ACCESS_TOKEN = 'access_token';

// This function will check if the user is logged in
export const getITem = (key) => {
  return localStorage.getItem(key);
};

// This function will save the access token to local storage and then remember that the user is already logged in
export const setItem = (key, value) => {
  return localStorage.setItem(key, value);
};

// This function will log out the user
export const removeItem = (key) => {
  return localStorage.removeItem(key);
};
```

### Axios Interceptors

When our access token will expire, our API will send the status code of `401`, would we tell our users that your access token is expired? No. We will silently refresh the access token so that the user experience will remain good. For this we will not need any new package because Axios supports this itself. We get two interceptors, one is Request interceptor, and the other is Response interceptor. Majorly we will use the response interceptor.

To create the interceptor function we can do this -

```javascript
// This will intercept the request
axiosClient.interceptors.request.use();

// This will intercept the response
axiosClient.interceptors.response.use();
```

Lets first look at request -

```javascript
axiosClient.interceptors.request.use(
  // We get a config object in our parameters
    (request) => {
      // Getting the access token and setting it inside of the request headers as how we are expecting it to be in our backend.
        const accessToken = getITem(KEY_ACCESS_TOKEN);
        request.headers['Authorization'] = `Bearer ${accessToken}`;

        return request;
    }
);
```

Lets now look at response interceptor -

```javascript
axiosClient.interceptors.response.use(async (response) => {
  const data = response.data;
    // If the status is ok then everything is fine
  if (data.status === 'ok') {
    return data;
  }

    // Extracting few data from the response and saving it in variable
  const originalRequest = response.config;
  const statusCode = data.statusCode;
  const error = data.message;

  if (
    // When refresh token expires, logout the user completely and send the user back to login page.
    statusCode === 401 &&
    originalRequest.url === 'http://localhost4000/v1/auth/refreshtoken'
  ) {
    removeItem(KEY_ACCESS_TOKEN);
    window.location.replace('/login', '_self');
    return Promise.reject(error);
  }

    // If the statuscode responds with 401 then we will call the refreshtoken API and then check if the status is ok, because if its not ok then it must be because the refreshtoken has been expired (1 year later), if its ok then set new access token received from refreshtoken API.
  if (statusCode === 401) {
    const response = await axiosClient.get('/auth/refreshtoken');
    if (response.status === 'ok') {
      setItem(KEY_ACCESS_TOKEN, response?.result?.accessToken);
      // console.log('response in interceptor', response?.result);
      originalRequest.headers[
        'Authorization'
      ] = `Bearer ${response?.result?.accessToken}`;
      return axios(originalRequest);
    }
  }

    // If theres any other type of error, then just reject the promise with the error variable which is holding our error message.
  return Promise.reject(error);
});
```

Now inside Login.js file, we will create our login post API call -

```javascript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const result = await axiosClient.post('/auth/login', {
        email,
        password,
        });
        setItem(KEY_ACCESS_TOKEN, result?.result?.accessToken);
        navigate('/');
    } catch (err) {
        console.log(err);
    }
};
```

When the user logs in, he will be redirected to home page automatically. Similar thing will happen in Sign up.js file, we can just copy and paste this there and customize a little like instead of `/auth/login` we will do `/auth/signup`.

We do not want the user to access our Home.js unless they are logged in, so we can protect our route like this -

1. Create a file named `RequireUser.js` inside of `components` folder and do this:

```javascript
const RequireUser = () => {
  const user = getITem(KEY_ACCESS_TOKEN);
  return user ? <Outlet /> : <Navigate to='/login' />;
};
```

2. Go to `App.js` and wrap another `<Route></Route>` and the Home route like this:

```javascript
<Route element={<RequireUser />}>
    <Route path='/' element={<Home />} />
</Route>
```

Now we will fetch a simple demo api in home page like this -

```javascript
useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
          //  console.log(getItem(KEY_ACCESS_TOKEN));
            const response = await axiosClient.post('/post/all');
            console.log('response from backend', response);
        } catch (err) {
            console.log(err);
        }
    };
```

By doing this, the user will not be able to access our home page without being logged in.

**Now we will go back to server and create new API's**

After setting up the backend, now we can move to frontend part again.

## Creating components

***Updating global css inside of index.css***

```css
:root {
  --border-color: #dadada;
  --accent-color: #192A56;
  --secondary-color: #088eac;
  --button-color: #2475B0;
}

.container {
  max-width: 960px;
  margin-inline: auto;
}

h1, h2, h3, h4, h5, h6 {
  color: #0A3D62;
  user-select: none;
}

h3, h6 {
  font-weight: 400;
}

p {
  color: #1d5c8a;
  font-size: 0.9rem;
}

.hover-link {
  cursor: pointer;
}

.hover-link:active {
  color: var(--secondary-color);
}
```

### Preparing home page with new components

Inside components folder we will create 4 new folders which will have set of js and scss files, 1: feed, 2: navbar, 3: profile, 4: avatar.

1. Inside of navbar we will create our component like this -

```javascript
const Navbar = () => {

  const navigate = useNavigate();

  return (
    <div className='Navbar'>
        <div className='container'>
            <h2 className='banner hover-link' onClick={() => navigate('/')}>PicsMart</h2>
            <div className='right-side'>
                <div className='profile hover-link' onClick={() => navigate('/profile/123')}>
                    <Avatar />
                </div>
            </div>
        </div>
    </div>
  )
}
```

```css
.Navbar {
    height: 60px;
    width: 100%;
    background-color: #fff;
    border-bottom: 1px solid var(--border-color);
    position:sticky;
    top: 0;

    .container {

        h2 {
            font-family: dancing;
            font-size: 3em;
        }

        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
}
```

2. Now we will create our avatar like this -

```javascript
const Avatar = ({src}) => {
  return (
    <div className='Avatar'>
        <img src={src ? src : userImg} alt='user avatar'/>
    </div>
  )
}
```

```css
.Avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;

    img {
        width: 100%;
        height: 100%;
    }
}
```

To get a default avatar image I used the website `flaticon`.

Lets create our Feed.js component -

```javascript
const Feed = () => {
  return (
    <div className='Feed'>
      <div className='container'>
        <div className="left-part"></div>
        <div className="right-part"></div>
      </div>
    </div>
  )
}
```

```css
.Feed {
    height: 100vh;
    .container {
        display: flex;
        // overflow: hidden;

        .left-part {
            flex: 2;
            // background-color: red;
        }
        .right-part {
            flex: 1;
            // background: green;
            .following {
                margin-top: 20px;
                padding-left: 20px;
            }
            .suggestion {
                margin-top: 20px;
                padding-left: 20px;
            }
        }
    }
}
```

Now our Feed has been created, on the left side we will show the posts of users they are following, and on right side we will show them suggestions to follow for.

We will move to post now. Create Post.js and Post.scss -

***For icons we will use react icons website***

```bash
npm i react-icons --save
```

```javascript
const Post = ({ post }) => {
  return (
    <div className='Post'>
      <div className='heading'>
        <Avatar />
        <h4>Aquib</h4>
      </div>
      <div className='content'>
        <img
          src='https://plus.unsplash.com/premium_photo-1673292293042-cafd9c8a3ab3?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          alt=''
        />
      </div>
      <div className='footer'>
        <div className='like'>
          {false ? (
            <IoMdHeart className='hover-link heart' />
          ) : (
            <IoIosHeartEmpty className='hover-link icon' />
          )}
          <h4>4 likes</h4>
        </div>
        <p className='caption'>This is nature picture</p>
        <h6 className='time'>4 hours ago</h6>
      </div>
    </div>
  );
};
```

```css
.Post {
  border: 1px solid var(--border-color);
  margin-top: 20px;
  border-radius: 4px;
  .heading {
    display: flex;
    align-items: center;
    gap: 40px;
    // height: 60px;
    padding: 15px 20px;
    border-bottom: 1px solid var(--border-color);
  }

  .content {
    height: 400px;
    img {
      width: 100%;
      height: 100%;
      user-select: none;
      object-fit: cover;
      object-position: center;
    }
  }

  .footer {
    padding: 15px 20px;

    .like {
      display: flex;
      align-items: start;
      flex-direction: column;
      gap: 5px;

      .heart {
        color: red;
        font-size: 2rem;
      }

      .icon {
        font-size: 2rem;
      }
    }
    .caption {
      margin-top: 10px;
    }
    .time {
      margin-top: 5px;
      color: var(--light-color);
    }
  }
}

```

Now lets render the Post few times to see how multiple posts will look like on our home page.

```javascript
const Feed = () => {
  return (
    <div className='Feed'>
      <div className='container'>
        <div className='left-part'>
          <Post />
          <Post />
          <Post />
          <Post />
          <Post />
          <Post />
        </div>
        <div className='right-part'></div>
      </div>
    </div>
  );
};
```

On the right-part of the feed we will create list of users they are following -

```javascript
<div className='right-part'>
    <div className='following'>
      <h3 className='title'>Followings -</h3>
    </div>
    <div className='suggestion'>
      <h3 className='title'>Suggestions -</h3>
    </div>
</div>
```

We will have to create a new component called follower and following -

```javascript
const Follower = () => {
  return (
    <div className='Follower'>
      <div className='user-info'>
        <Avatar />
        <h4 className='name'>Demo1</h4>
      </div>
      <h5 className='hover-link follow-link'>Follow</h5>
    </div>
  );
};
```

```css
.Follower {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    border-bottom: 1px solid var(--border-color);

    .user-info {
        display: flex;
        gap: 20px;
        justify-content: center;
        align-items: center;
    }

    .follow-link {
        color: var(--accent-color);
    }
}
```

then add these on the right-part of feed, just for demo -

```javascript
//Feed.js
<div className='right-part'>
    <div className='following'>
      <h3 className='title'>Followings -</h3>
      <Follower />
      <Follower />
      <Follower />
      <Follower />
      <Follower />
    </div>
    <div className='suggestion'>
      <h3 className='title'>Suggestions -</h3>
      <Follower />
      <Follower />
      <Follower />
      <Follower />
      <Follower />
    </div>
</div>
```

We will move to Profile.js and scss now -

```javascript
const Profile = () => {
    return (
        <div className='Profile'>
            <div className='container'>
                <div className='left-part'>
                    <Post />
                    <Post />
                    <Post />
                    <Post />
                </div>
                <div className='right-part'>
                    <div className='profile-card'>
                        <img className='user-img' src={userImg} alt='' />
                        <h3 className='username'>Aquib Ali</h3>
                        <div className='follower-info'>
                            <h4>40 followers</h4>
                            <h4>12 following</h4>
                        </div>
                        <button className='follow btn-primary hover-link'>
                            Follow
                        </button>
                        <button className='update-profile btn-secondary hover-link'>
                            Update Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
```

We will create two new global style in index.css -

```css
.btn-primary {
  background-color: var(--accent-color);
  color: white;
  font-weight: bold;
}

.btn-primary:hover {
  background-color: var(--accent-color2);
}

.btn-primary:active {
  background-color: var(--accent-color);
}

.btn-secondary {
  border: 2px solid var(--accent-color);
  color: var(--accent-color);
  font-weight: bold;
}

.btn-secondary:hover {
  border: 2px solid var(--accent-color2);
  color: var(--accent-color2);
}

.btn-secondary:active {
  color: var(--secondary-color);
}
```

```css
.Profile {
    height: calc(100vh - 60px);
    .container {
        display: flex;
        gap: 20px;

        .left-part {
            flex: 2;
            // background-color: red;
        }
        .right-part {
            flex: 1;
            // background: green;
            margin-top: 20px;

            .profile-card {
                padding: 40px;
                border: 1px solid var(--border-color);
                border-radius: 4px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: 10px;

                .user-img {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                }

                .follower-info {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 20px;
                }

                .follow {
                    padding: 5px 10px;
                    border-radius: 5px;
                    border: none;
                    font-size: 1.2rem;
                }

                .update-profile {
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-size: 1.2rem;
                }
            }
        }
    }
}
```

Lets create a logout button on navbar. To get a logout icon i will again use react icons website.

```javascript
const Navbar = () => {

  const navigate = useNavigate();

  return (
    <div className='Navbar'>
        <div className='container'>
            <h2 className='banner hover-link' onClick={() => navigate('/')}>PicsMart</h2>
            <div className='right-side'>
                <div className='profile hover-link' onClick={() => navigate('/profile/123')}>
                    <Avatar />
                </div>
                <div className="logout hover-link">
                {/* <BiLogOutCircle /> */}
                <CiLogout />
                <p className='logout-text'>logout</p>
                </div>
            </div>
        </div>
    </div>
  )
}
```

```css
.container {

    h2 {
        font-family: dancing;
        font-size: 3em;
    }

    height: 100%;
    // max-width: 960px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    // margin-inline: auto;

    .right-side {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;

        .logout {
            font-size: 1.6rem;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;

            .logout-text {
                color: var(--accent-color);
            }
        }
    }
}
```

Now we will install a package to create a progress bar on our application, the name of this package is `react-top-loading-bar`, lets install it -

```bash
npm i react-top-loading-bar
```

Just for an example we will add this progress bar in our navbar because we have a logout button in navbar now.

```javascript
const Navbar = () => {
  const navigate = useNavigate();
  //Created these for loading
  const loadingRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const toggleLoading = () => {
    if (loading) {
      setLoading(false);
      loadingRef.current.complete();
    } else {
      setLoading(true);
      loadingRef.current.continuousStart();
    }
  }

  return (
    <div className='Navbar'>
      <LoadingBar height={4} color={"var(--accent-color)"} ref={loadingRef}/>
        <div className='container'>
            <h2 className='banner hover-link' onClick={() => navigate('/')}>PicsMart</h2>
            <div className='right-side'>
                <div className='profile hover-link' onClick={() => navigate('/profile/123')}>
                    <Avatar />
                </div>
                {/* Loading */}
                <div className="logout hover-link" onClick={toggleLoading}>
                <BiLogOutCircle />
                <p className='logout-text'>logout</p>
                </div>
            </div>
        </div>
    </div>
  )
}
```

We will now create update profile page -

```javascript
import React from 'react';
import './UpdateProfile.scss';
import userImg from '../../assets/imgs/user.png';

const UpdateProfile = () => {
  return (
    <div className='UpdateProfile'>
      <div className='container'>
        <div className='leftPart'>
          <img className='user-img' src={userImg} alt='' />
        </div>
        <div className='rightPart'>
          <form>
            <input type='text' placeholder='Your Name' />
            <input type='text' placeholder='Your Bio' />

            <input type='submit' className='btn-primary' />
          </form>
          <button className='delete-account btn-primary hover-link'>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
```

```css
.UpdateProfile {
    margin-top: 20px;
    .container {
        display: flex;
        align-items: center;
        justify-content: center;

        .leftPart {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;

            .user-img {
                width: 80px;
                height: 80px;
                border-radius: 50%;
            }
        }
        .rightPart {
            flex: 3;

            form {
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 50px;
            }

            input {
                display: block;
                padding: 8px 16px;
                width: 100%;
                margin-top: 16px;
                border-radius: 4px;
                border: 1px solid var(--border-color);
            }

            input[type='submit'] {
                width: fit-content;
            }

            .delete-account {
                background-color: red;
                margin-top: 16px;
                padding: 8px 16px;
                border-radius: 4px;
            }
        }
    }
}
```

Add new route in app.js -

```javascript
//app.js
//below profile route
<Route path='updateProfile' element={<UpdateProfile />} />
```

now go to Profile.js to make our update profile button workable -

```javascript
//profile.js
const navigate = useNavigate();

//html
<button className='update-profile btn-secondary hover-link' onClick={() => navigate('/updateProfile')}>
  Update Profile
</button>
```

### Updating axios client

In our code -

```javascript
const response = await axios
    .create({
      withCredentials: true,
      baseURL: 'http://localhost:4000/v1',
    })
    .post('/auth/refreshtoken');
console.log('got the refresh token');
```

we were not using our axiosClient and recreated new axios, using this we will not be able to refresh the users refresh token so we will have to handle that one more time like this -

```javascript
if (response.data.status === 'ok') {
  setItem(KEY_ACCESS_TOKEN, response.data.result.accessToken);
  originalRequest.headers[
    'Authorization'
  ] = `Bearer ${response.data.result.accessToken}`;
  return axios(originalRequest);
} else {
  removeItem(KEY_ACCESS_TOKEN);
  window.location.replace('/login', '_self');
  return Promise.reject(errorMessage);
}
```

Now we can remove the validation above in axiosClient.js for logging them out, because now that work is being done here.

### Fetching data

To fetch our data we will not pass the data from child to parent. We will use redux to store the data and fetch the data and provide it into our whole app and use the stored data where its needed.

We will create a new folder in src folder called `redux`

```bash
npm i @reduxjs/toolkit react-redux
```

Go to redux folder and create a store.js file

```javascript
import { configureStore } from "@reduxjs/toolkit";

export default configureStore({
    reducer: {
        
    }
})
```

Now we will provide the store to our whole app in our index.js file -

```javascript
<Provider store={store}>
  <App />
</Provider>
```

**Creating slice**

If you remember we had a loading bar on top of our navbar, so if we want it to work on our each and every api calls we will have to handle it with creating a new slice called `appConfigSlice.js` -

```javascript
import { createSlice } from '@reduxjs/toolkit';

const appConfigSlice = createSlice({
  name: 'appConfigSlice',

  initialState: {
    isLoading: false,
  },

  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export default appConfigSlice.reducer;

export const { setLoading } = appConfigSlice.actions;

```

and now we can provide this slice into our store we had created -

```javascript
import { configureStore } from "@reduxjs/toolkit";
import appConfigReducer from './slices/appConfigSlice.js'

export default configureStore({
    reducer: {
        appConfigReducer
    }
})
```

now remove the loader from our navbar and put it in our app.js -

```javascript
const App = () => {
  const isLoading = useSelector(state => state.appConfigReducer.isLoading);
  const loadingRef = useRef(null)

  useEffect(() => {
    if (isLoading) {
      loadingRef.current?.continuousStart();
    } else {
      loadingRef.current?.complete();
    }
  }, [isLoading])
  return (
    <div className='App'>
      <LoadingBar
        color={'var(--accent-color)'}
        ref={loadingRef}
      />
  // continue ---->>
```

lets check if our logic is working or not, lets go back to navbar.js and do this -

```javascript
// Navbar.js
const dispatch = useDispatch();

const toggleLoading = () => {
  dispatch(setLoading(true));
}
```

## go back to server

Now after returning from server we can continue.

### Fetching data with redux thunk

we will go to our appConfigSlice.js and fetch our data like this -

```javascript
export const getMyInfo = createAsyncThunk('user/getMyInfo', async (body, thunkAPI) => {
  try {
    thunkAPI.dispatch(setLoading(true));
    const response = await axiosClient.get('/user/getMyInfo');
    console.log('data fetched', response.result);
        return response.result
  } catch (err) { 
    return Promise.reject(err);
  } finally {
    thunkAPI.dispatch(setLoading(false));
}
});
```

Now to check if this is working fine or not, we will go to home.js and call this function.

```javascript
const dispatch = useDispatch();

useEffect(() => {
  dispatch(getMyInfo());
}, [])
```

We are successfully getting the data, now we can save the data in our redux, we will go to appConfigSlice and inside of reducers we will add this -

```javascript
initialState: {
  isLoading: false,
  myProfile: {} //added
},
```

now we will create `extraReducers` in our appConfigSlice.js -

```javascript
extraReducers: (builder) => {
    builder.addCase(getMyInfo.fulfilled, (state, action) => {
        state.myProfile = action.payload.user
    })
}
```

Now lets use our data which we have fetched `myProfile`.

Firstly let us go to our navbar.js and use our data -

```javascript
//navbar.js
const myProfile = useSelector(state => state.appConfigReducer.myProfile);

<Avatar src={myProfile?.avatar?.url} />
```

For now we have not implemented cloudinary database in our backend so we will not be able to see the data being changed.

**Delete the toggle loading bar function from our navbar.js.**

```javascript
const handleLogout = () => {
    
}

<div className="logout hover-link" onClick={handleLogout}> ...
```

Update go to profile from navbar -

```javascript
//previously
<div className='profile hover-link' onClick={() => navigate('/profile/123')}>
    <Avatar src={myProfile?.avatar?.url} />
</div>

//updated
<div className='profile hover-link' onClick={() => navigate(`/profile/${myProfile?._id}`)}>
    <Avatar src={myProfile?.avatar?.url} />
</div>
```

Now update our `update profile` page -

```javascript
//UpdateProfile.js
const myProfile = useSelector(state => state.appConfigReducer.myProfile);
const [name, setName] = useState("")
const [bio, setBio] = useState("")
const [userImg, setUserImg] = useState("");
const dispatch = useDispatch();
useEffect(() => {
  setName(myProfile?.name || "");
  setBio(myProfile?.bio || "");
  setUserImg(myProfile?.avatar?.url || "")
}, [myProfile]);

const handleImageChange = (e) => {
  //choose file from array
  const file = e.target.files[0];
  //create new file reader
  const fileReader = new FileReader();
  //pass the file to the file reader
  fileReader.readAsDataURL(file);
  //if file has done pushing, set it to our useState
  fileReader.onload = () => {
    if (fileReader.readyState === fileReader.DONE) {
      setUserImg(fileReader.result);
    }
  };
};



//remove the img tag and replace it with this -
<div className="input-user-img">
  <label htmlFor="inputImg" className='labelImg'>
    <img src={userImg} alt={name} />
  </label>
  <input id='inputImg' className='userImg' type="file" accept='image/*'onChange={handleImageChange}/>
</div>

<form onSubmit={handleSubmit}> ...
<input type='submit' className='btn-primary' onClick={handleSubmit} />
...

<input value={name} type='text' placeholder='Your Name' onChange={(e) => setName(e.target.value)}/>
<input value={bio} type='text' placeholder='Your Bio' onChange={(e) => setBio(e.target.value)}/>
```

Now lets update the `updateProfile.scss`

```css
.leftPart {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    .input-user-img {
        display: flex;
        align-items: center;
        justify-content: center;

        .labelImg {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 2px dashed var(--accent-color);
            cursor: pointer;

            img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                object-fit: cover;
            }
        }

        .userImg {
            display: none;
        }
    }
}
```

**Go back to server**

lets create another async thunk in our appConfigSlice -

```javascript
export const updateMyProfile = createAsyncThunk(
  'user/updateMyProfile',
  async (body, thunkAPI) => {
    try {
      thunkAPI.dispatch(setLoading(true));
      const response = await axiosClient.put('/user/', body);

      return response.result;
    } catch (err) {
      return Promise.reject(err);
    } finally {
      thunkAPI.dispatch(setLoading(false));
    }
  }
);
```

and add another case -

```javascript
.addCase(updateMyProfile.fulfilled, (state, action) => {
  state.myProfile = action.payload?.user;
});
```

go back to updateProfile.js

```javascript
const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      updateMyProfile({
        name,
        bio,
        userImg,
      })
    );
};
```

Now create a CreatePost folder in components and file of js and scss -

```javascript
const [postImg, setPostImg] = useState('');
const [caption, setCaption] = useState('');
const dispatch = useDispatch();
const myProfile = useSelector((state) => state.appConfigReducer.myProfile);

const handleImageChange = (e) => {
    try {
        const file = e.target.files[0];
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => {
            if (fileReader.readyState === fileReader.DONE) {
                setPostImg(fileReader.result);
            }
        };
    } catch (err) {
        console.log(err);
    }
};

const handlePostSubmit = async () => {
    try {
        dispatch(setLoading(true));
        const result = await axiosClient.post('/post/', {
            caption,
            postImg,
        });

        console.log("post posted", result);
    } catch (error) {
    } finally {
        setCaption('');
        setPostImg('');
        dispatch(setLoading(false));
    }
};

<div className='CreatePost'>
    <div className="createPost">
        <div className="left-part">
            <Avatar src={myProfile?.avatar?.url} />
        </div>
        <div className="right-part">
            {postImg && (
                <div className="img-container">
                    <img
                        className="post-img"
                        src={postImg}
                        alt={myProfile?.name}
                    />
                </div>
            )}

            <input
                type="text"
                className="captionInput"
                placeholder="What's on your mind?"
                value={caption || ''}
                onChange={(e) => setCaption(e.target.value)}
            />

            <div className="bottom-part">
                <div className="input-post-img">
                    <label htmlFor="inputImg" className="labelImg btn-primary">
                        <BsCardImage />
                    </label>
                    <input
                        id="inputImg"
                        className="inputImg"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>
                <button
                    className="post-btn btn-primary"
                    onClick={handlePostSubmit}
                >
                    Post
                </button>
            </div>
        </div>
    </div>
</div>
```

```css
.createPost {
    display: flex;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 20px;
    gap: 20px;
    margin-top: 20px;

    .left-part {
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: content;
        // margin-top: 40px;
    }

    .right-part {
        flex-grow: 100 !important;
        margin-top: 0;
        padding: 0;
        padding: 20px;

        .captionInput {
            border: 1px solid var(--border-color);
            // display: block;
        }

        .img-container {
            margin-top: 20px;

            .post-img {
                width: 100%;
                border: 1px solid var(--border-color);
                border-radius: 6px;
            }
        }

        .labelImg {
            display: inline-block;
            background-color: var(--accent-color);
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
        }

        input {
            width: 100%;
            padding: 8px 16px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            margin-top: 10px;
        }

        .inputImg {
            display: none;
        }

        .bottom-part {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;

            .post-btn {
                border: none;
                border-radius: 6px;
                padding: 10px 15px;
            }
        }
    }
}
```

Now render this in our Profile.js -

```javascript
<div className='left-part'>
  <CreatePost />...
  <Post />
  <Post />
  <Post />
  <Post />
</div>
```


**go back to server**

Create a new slice called postsSlice.js -

```javascript
export const getUserProfile = createAsyncThunk(
    'user/getUserProfile',
    async (body, thunkAPI) => {
        try {
            thunkAPI.dispatch(setLoading(true));
            const response = await axiosClient.post('/user/getUserProfile', body);
            console.log('data fetched', response.result);
            return response.result;
        } catch (err) {
            return Promise.reject(err);
        } finally {
            thunkAPI.dispatch(setLoading(false));
        }
    }
);

const postSlice = createSlice({
    name: 'postSlice',

    initialState: {
        userProfile: {}
    },

    extraReducers: (builder) => {
        builder.addCase(getUserProfile.fulfilled, (state, action) => {
            state.userProfile = action.payload;
        });
    },
});

export default postSlice.reducer;
```

Now lets work on the Profile.js file -

```javascript
const Profile = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const userProfile = useSelector((state) => state.postReducer.userProfile);
    const myProfile = useSelector((state) => state.appConfigReducer.myProfile);
    const [isMyProfile, setIsMyProfile] = useState(false);

    useEffect(() => {
        dispatch(
            getUserProfile({
                userId: params.userId,
            })
        );

        setIsMyProfile(myProfile?._id === params.userId);
    }, [myProfile]);

    return (
        <div className='Profile'>
            <div className='container'>
                <div className='left-part'>
                    <CreatePost />
                    <Post post={userProfile?.posts} />
                </div>
                <div className='right-part'>
                    <div className='profile-card'>
                        <img
                            className='user-img'
                            src={userProfile?.avatar?.url || userImg}
                            alt={userProfile.name}
                        />
                        <h3 className='username'>{userProfile?.name}</h3>
                        <div className='follower-info'>
                            <h4>{userProfile?.followers?.length} followers</h4>
                            <h4>{userProfile?.followings?.length} following</h4>
                        </div>
                        {!isMyProfile && (
                            <button className='follow btn-primary hover-link'>
                                Follow
                            </button>
                        )}

                        {isMyProfile && (
                            <button
                                className='update-profile btn-secondary hover-link'
                                onClick={() => navigate('/updateProfile')}
                            >
                                Update Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
```

The user is able to go to the login page even after being logged in and its not a good practice to let them do whatever they want! So for that we will need to handle it with a simple trick -

1. Create a new file in our components folder just as requireUser.js, lets name it notLoggedIn.js -

```javascript
const NotLoggedIn = () => {
    const user = getItem(KEY_ACCESS_TOKEN);

  return (
    <div>
        {user ? <Navigate to="/"/> : <Outlet />}
    </div>
  )
}
```

now go back to app.js and wrap your signup and login routes inside of NotLoggedIn Route -

```javascript
<Route element={<NotLoggedIn />}>
  <Route path='/login' element={<Login />} />
  <Route path='/signup' element={<Signup />} />
</Route>
```

Now add one more line in our createpost.js -

```javascript
const handlePostSubmit = async () => {
    try {
    dispatch(setLoading(true));
    const result = await axiosClient.post('/post/', {
        caption,
        postImg,
    });
    dispatch(getUserProfile({
        userId: myProfile?._id
    })); ....
```

We are doing this because when the user creates a new post they will have to reload the page in order to get the newest post in their profile. So in order to automate this process we fetched the data again with one more post that user has created at the moment.

Now lets render the posts of the current user that is being visited in our profile.js file -

```javascript
{userProfile?.posts?.map((post) => {
    return <Post post={post} key={post._id}/>
})}
```

Now lets handle post.js -

```javascript
return (
    <div className='Post'>
        <div className='heading'>
            <Avatar src={post?.owner?.avatar?.url}/>
            <h4>{post?.owner?.name}</h4>
        </div>
        <div className='content'>
            <img
                src={post?.image?.url || 'https://plus.unsplash.com/premium_photo-1673292293042-cafd9c8a3ab3?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                alt={post?.owner?.name}
            />
        </div>
        <div className='footer'>
            <div className='like'>
                {false ? (
                    <IoMdHeart className='hover-link heart' />
                ) : (
                    <IoIosHeartEmpty className='hover-link icon' />
                )}
                <h4>{post?.likesCount} likes</h4>
            </div>
            <p className='caption'>{post?.caption}</p>
            <h6 className='time'>{post?.timeAgo}</h6>
        </div>
</div>
);
```

**Go back to server** 

now we will create another asyncThunk in postslice.js for liking and unliking -

```javascript
export const likeAndUnlike = createAsyncThunk(
    'post/likeAndUnlike',
    async (body, thunkAPI) => {
        try {
            thunkAPI.dispatch(setLoading(true));
            const response = await axiosClient.post('/post/like', body);
            return response.result.post;
        } catch (err) {
            return Promise.reject(err);
        } finally {
            thunkAPI.dispatch(setLoading(false));
        }
    }
);
```

updating our Post.js again -

```javascript
const dispatch = useDispatch();
    const handlePostLike = async () => {
        dispatch(
            likeAndUnlike({
                postId: post?._id,
            })
    );
};
```

lets add another case in postslice -

```javascript
.addCase(likeAndUnlike.fulfilled, (state, action) => {
    const post = action.payload;
    console.log("liked?", post);
    const index = state.userProfile.posts.findIndex(item => item._id === post._id)
    if (index !== -1) {
        state.userProfile.posts[index] = post;
    }
})
```

now we can update our post with red heart if liked -

```javascript
{post?.isLiked ? ( ....
```
