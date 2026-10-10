GAMERZADDA legal pages
Copy the four folders into the same root folder as your website index.html and style.css.
Keep the existing assets folder as-is.

Pages:
  /privacy-policy/
  /terms-and-conditions/
  /refund-policy/
  /contact/

The homepage links use these extensionless paths. With Live Server, folder index.html files will open.
If your hosting server does not resolve extensionless folders automatically, configure Nginx try_files or change footer links to include the trailing slash.
