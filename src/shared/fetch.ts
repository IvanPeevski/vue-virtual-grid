export function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function timeout (msTimeout, promise) {
  let timedOut = false

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      timedOut = true
      reject(new Error("Timeout"))
    }, msTimeout)
    promise.then(
      (res) => {
        clearTimeout(timeoutId)
        if (!timedOut) {
          resolve(res)
        }
      },
      (err) => {
        clearTimeout(timeoutId)
        if (timedOut) { // already rejected on setTimeout
          return
        }
        reject(err)
      }
    )
  })
}

export async function fetch$ (url, options = {}, msTimeout = 10000, multiPart = false) {
  let controller, signal;

  try {
    controller = new AbortController();
    signal = { signal: controller.signal };
  } catch (error) {
    controller = null;
    signal = undefined;
  }

  let fixedOptions = {};
  if (!multiPart) {
    fixedOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }

  const finalOptions = Object.assign({}, fixedOptions, signal, options);

  let response = null;

  try {
    response = await timeout(msTimeout, fetch(url, finalOptions));
  } catch (e) {
    if (controller !== null) {
      controller.abort();
    }
    let status_code;
    if (e.message === 'Timeout') {
      status_code = 504;
    } else {
      status_code = 500;
    }
    const error = new Error(e.message);
    error.status = status_code;
    throw error;
  }

  if (response !== null && response.ok) {
    return await response.json();
  } else {
    const message = await response.text();
    const error = new Error(message);
    error.response = response;
    error.status = response.status;
    throw error;
  }

}


let csrfToken: string | null = null;


export const invalidateCsrfToken = async () => {
  csrfToken = null;
}

export const getCsrfToken = async () => {
  if (csrfToken === null) {
    console.log("GET CSRF TOKEN")
    // Em modo de Produção ... o SPA vai ter o mesmo domínio e poderá ser utilizada a cookie
    if (import.meta.env.PROD) {
      csrfToken = getCookie('csrftoken');
    } else {
      const get_res = await fetchGet('/login/');
      if (!get_res.success) {
        throw Error("Problemas a obter token CSRF!");
      }
      csrfToken = get_res.token;
    }
  }
  return csrfToken;
};

export const fetchGet = async (url: string, options = {}, msTimeout = 10000) => {
  const finalOptions = Object.assign(
    {},
    {
      credentials: 'include',
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    },
    options
  );
  return await fetch$(`/api${url}`, finalOptions, msTimeout);
};

export const fetchPost = async (url: string, data: {}, options = {}, msTimeout = 10000) => {
  const finalOptions = Object.assign(
    {},
    {
      credentials: 'include',
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': await getCsrfToken()
      },
      body: JSON.stringify(data)
    },
    options
  );
  return await fetch$(`/api${url}`, finalOptions, msTimeout);
};

export const fetchPut = async (url: string, data: {}, options = {}, msTimeout = 10000) => {
  const finalOptions = Object.assign(
    {},
    {
      credentials: 'include',
      method: 'PUT',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        // 'X-CSRFToken': await getCsrfToken()
      },
      body: JSON.stringify(data)
    },
    options
  );
  return await fetch$(`/api${url}`, finalOptions, msTimeout);
};

export const fetchDelete = async (url: string, options = {}, msTimeout = 10000) => {
  const finalOptions = Object.assign(
    {},
    {
      credentials: 'include',
      method: 'DELETE',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': await getCsrfToken()
      }
    },
    options
  );
  return await fetch$(`/api${url}`, finalOptions, msTimeout);
};
