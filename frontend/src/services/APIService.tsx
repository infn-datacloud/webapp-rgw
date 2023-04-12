
class APIService {
  static isTokenValid(): boolean {
    return true;
  }

  static isAuthenticated = () => {
    return this.isTokenValid();
  }

  static get(input: RequestInfo | URL, init?: RequestInit | undefined): Promise<any> {
    if (!APIService.isAuthenticated()) {
      return Promise.reject(new Error("Your are not autenticated"));
    }

    return new Promise((resolve, reject) => {
      fetch("/api/v1/" + input, init)
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(err => reject(err));
    });
  }
}

export default APIService;