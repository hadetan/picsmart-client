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

Instead of using plain css we will be using `SASS` which is alot better compared to plain css in big production projects.

Install SASS -

```bash
npm i sass
```

Now create sass files inside both login & signup folders using `.scss` file extention. After creating both login and signup pages I created home page where I only created the function and exported it.

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

Now we will save this access token which is coming from the response of the API, it is our own responsbility to save the token to the local storage.

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

    // If the statuscode responds with 401 then we will call the refreshtoken API and then check if the status is ok, because if its not ok then it must be because the refreshtoken has been expired (1 year later), if its ok then set new access token recieved from refreshtoken API.
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

When the user logs in, he will be redirected to home page automatically. Similar thing will happen in Signup.js file, we can just copy and paste this there and customize a little like instead of `/auth/login` we will do `/auth/signup`.

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

By doing this, the user will not be able to access our home page without being logged in.
