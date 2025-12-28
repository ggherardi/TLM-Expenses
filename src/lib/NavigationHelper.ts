class NavigationHelper {
  // @ts-ignore
  public homeBaseNavigation;
  // @ts-ignore
  public homeTabNavigation;  
  // @ts-ignore
  public eventBaseNavigation;
  // @ts-ignore  
  public eventTabNavigation;   
  static instance: NavigationHelper;

  // @ts-ignore
  static init() {
    if (!this.instance) {
      this.instance = new NavigationHelper();
    }        
  }

  // @ts-ignore
  static setHomeBaseNavigation(navigation) {
    this.init();
    this.instance.homeBaseNavigation = navigation;
  }

  // @ts-ignore
  static setHomeTabNavigation(navigation) {
    this.init();
    this.instance.homeTabNavigation = navigation;
  }

  // @ts-ignore
  static setEventBaseNavigation(navigation) {
    this.init();
    this.instance.eventBaseNavigation = navigation;
  }

  // @ts-ignore
  static setEventTabNavigation(navigation) {
    this.init();
    this.instance.eventTabNavigation = navigation;
  }

  static getHomeBaseNavigation() {
    return this.instance.homeBaseNavigation;
  }

  static getHomeTabNavigation() {
    return this.instance.homeTabNavigation;
  }

  static getEventBaseNavigation() {
    return this.instance.eventBaseNavigation;
  }

  static getEventTabNavigation() {
    return this.instance.eventTabNavigation;
  }
}

export default NavigationHelper;
