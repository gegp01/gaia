#### Collect data from Earth Data 
https://disc.gsfc.nasa.gov/datasets/

(1) Collect url lists to download data.

(2) Use wget to download Data from official website

~~~
    wget --load-cookies C:\.urs_cookies --save-cookies C:\.urs_cookies --keep-session-cookies --user=<your username> --ask-password -i <url.txt>
~~~

Reference: https://disc.gsfc.nasa.gov/information/howto?title=How%20to%20Access%20GES%20DISC%20Data%20Using%20wget%20and%20curl

