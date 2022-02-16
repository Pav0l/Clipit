import { makeStyles, List, ListItem, ListItemText } from "@material-ui/core";

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

const useStyles = makeStyles(() => ({
  list: {
    listStyleType: "disc",
    listStylePosition: "outside",
  },
  itemText: {
    display: "list-item",
  },
}));
