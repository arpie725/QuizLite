import axios from 'axios';
import { NotFoundError, UnauthorizedError } from '../utils/errors.js';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

/** attempts to log in a user
 *  - make api call with the given credentials
 *  - assign token into local storage
 * @params - username (string), password (string)
 * @returns - None
 */
async function loginUser(username, password) {
  try {
    // make api call
    const res = await axios.post(`${apiUrl}/auth/login`, {
      username: username,
      password: password,
    });
    // handle successful login
    const { data } = res;
    const token = data.data.token;
    // assign token into local storage
    localStorage.setItem('token', token);
    return;
  } catch (er) {
    // get the errorType from [axios/response/data/errorType]
    const et = er.response.data.errorType;
    // handle expected errors
    if (et === 'UnauthorizedError') {
      throw new UnauthorizedError();
    }
    if (et === 'NotFoundError') {
      throw new NotFoundError();
    }
    // handle unexpected errors
    console.log(er);
    throw er;
  }
}

export { loginUser };
