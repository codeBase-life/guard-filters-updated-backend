const read_file = () => {
  try {
    if (!fs.existsSync(recently_file)) {
      return [];
    }
    const data = fs.readFileSync(recently_file, "utf-8");
    const parse_data = JSON.parse(data);

    parse_data.forEach((item) => {
      console.log(item);
    });
    return parse_data;
  } catch (error) {
    console.error("error reading file", error);
    return [];
  }
};
const write_file = (data) => {
  try {
    let read_data = read_file();
    if (!Array.isArray(read_data)) {
      read_data = [];
    }
    read_data = read_data.filter((item) => item.id !== data.id);
    read_data.unshift(data);
    if (read_data.length > 4) {
      read_data.pop();
    }
    fs.writeFileSync(
      recently_file,
      JSON.stringify(read_data, null, 2),
      "utf-8"
    );
    console.log("data written to file successfully");
  } catch (error) {
    console.error("error writing to file ", error);
  }
};