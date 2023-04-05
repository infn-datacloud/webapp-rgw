
class APIService {
  static isTokenValid(): boolean {
    return true;
  }

  static isAuthenticated = () => {
    return this.isTokenValid();
  }

  static async get(input: RequestInfo | URL, init?: RequestInit | undefined): Promise<any> {
    if (!APIService.isAuthenticated()) {
      return Promise.reject(new Error("Your are not autenticated"));
    }

    const response = await fetch("/api/v1/" + input, init);
    return JSON.parse(await response.json());
  }
}

export default APIService;