const capitalize = (s) => {
    try {
      if (s.length > 1) {
        return s.charAt(0).toUpperCase() + s.slice(1);
      } else if (s.length === 1) return s.toUpperCase();
      else return "";
    } catch {
      return "";
    }
  };
  
  export default capitalize;
  