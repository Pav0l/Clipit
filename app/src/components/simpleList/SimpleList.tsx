import { List, ListItem, ListItemText } from "@material-ui/core";
import { makeAppStyles } from "../../domains/theme/theme.constants";

interface Props {
  listItemTexts: string[];
}

export function SimpleList({ listItemTexts }: Props) {
  const classes = useStyles();

  return (
    <List dense className={classes.list}>
      {listItemTexts.map((itemText, idx) => (
        <ListItem key={idx}>
          <ListItemText primary={itemText} className={classes.itemText} />
        </ListItem>
      ))}
    </List>
  );
}

const useStyles = makeAppStyles(() => ({
  list: {
    listStyleType: "disc",
    listStylePosition: "outside",
  },
  itemText: {
    display: "list-item",
  },
}));
