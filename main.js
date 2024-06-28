import newEditor from "./editor.js";
import "@fontsource/unifont";
import "98.css";
import * as clang from "./clang";
// clang.compile(
//     {
//         "/main.cpp": {
//             content: `#include <bits/stdc++.h>
// using namespace std;
// int main(){
// 	string aa = "111";
// 	int s,sum = 0,last[2] = {0};
// 	bool a = false;
// 	while(cin >> s) {
// 		if(s > last[0]){
// 			sum++;
// 		}
// 		last[0] = s;
// 	}
// 	cout << sum;
// 	return 0;
// }`,
//         },
//     },
//     "main.cpp"
// );
newEditor(document.getElementById("editor"));
function handleTitle(title) {
    document.getElementById("title").innerHTML = title;
    document.title = title;
}
document.addEventListener("DOMContentLoaded", () =>
    handleTitle(__DEFINES__.name + " " + __DEFINES__.version)
);
