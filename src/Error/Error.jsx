import classes from "./Error.module.scss";
import { Link } from "react-router-dom";

export default function Error() {
  return (
    <div className={classes.container}>
      <h1>Page not found</h1>
      <Link to={"/"}>Return home</Link>
    </div>
  );
}